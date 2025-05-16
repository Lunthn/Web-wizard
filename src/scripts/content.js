(function () {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "analyze") {
      try {
        const colors = analyzeColors();
        const fonts = analyzeFonts();
        sendResponse({
          colors,
          fonts,
          url: window.location.href,
          title: document.title,
        });
        return true;
      } catch (error) {
        sendResponse({ error: error.message });
        return true;
      }
    } else if (message.action === "highlightColor") {
      highlightColor(
        message.color,
        true,
        { behavior: "smooth", block: "center" },
        message.highlightColor || "yellow"
      );
    } else if (message.action === "removeHighlight") {
      removeHighlight();
    }
  });

  function analyzeColors() {
    const colorMap = new Map();
    const elements = document.querySelectorAll("*");
    elements.forEach((element) => {
      if (element.offsetParent === null && element.tagName !== "BODY") return;
      const styles = window.getComputedStyle(element);
      const backgroundColor = styles.backgroundColor;
      const color = styles.color;
      const borderColor = styles.borderColor;
      const isVisibleColor = (colorValue) =>
        colorValue &&
        colorValue !== "rgba(0, 0, 0, 0)" &&
        colorValue !== "transparent";
      if (isVisibleColor(backgroundColor)) {
        addColor(
          colorMap,
          backgroundColor,
          "background",
          element.tagName.toLowerCase()
        );
      }
      if (isVisibleColor(color)) {
        addColor(colorMap, color, "text", element.tagName.toLowerCase());
      }
      if (isVisibleColor(borderColor)) {
        addColor(
          colorMap,
          borderColor,
          "border",
          element.tagName.toLowerCase()
        );
      }
    });
    return Array.from(colorMap.entries())
      .map(([colorCode, data]) => ({
        color: colorCode,
        count: data.count,
        elements: Array.from(data.elements),
      }))
      .sort((a, b) => b.count - a.count);
  }

  function addColor(colorMap, colorCode, usage, element) {
    if (!colorMap.has(colorCode)) {
      colorMap.set(colorCode, { count: 0, elements: new Set() });
    }
    const data = colorMap.get(colorCode);
    data.count++;
    data.elements.add(element);
  }

  function analyzeFonts() {
    const fontMap = new Map();
    const elements = document.querySelectorAll("body, body *");
    elements.forEach((element) => {
      if (!element.textContent.trim()) return;
      const styles = window.getComputedStyle(element);
      const fontFamily = styles.fontFamily;
      const fontSize = styles.fontSize;
      const fontWeight = styles.fontWeight;
      if (!fontFamily) return;
      const normalizedFontFamily = normalizeFontFamily(fontFamily);
      if (!fontMap.has(normalizedFontFamily)) {
        fontMap.set(normalizedFontFamily, {
          count: 0,
          weights: new Set(),
          sizes: new Set(),
          elements: new Set(),
        });
      }
      const data = fontMap.get(normalizedFontFamily);
      data.count++;
      data.weights.add(fontWeight);
      data.sizes.add(fontSize);
      data.elements.add(element.tagName.toLowerCase());
    });
    return Array.from(fontMap.entries())
      .map(([fontFamily, data]) => {
        const totalElements = Array.from(fontMap.values()).reduce(
          (sum, data) => sum + data.count,
          0
        );
        const usagePercentage =
          ((data.count / totalElements) * 100).toFixed(1) + "%";
        return {
          name: fontFamily,
          usage: usagePercentage,
          weight: Array.from(data.weights),
          sizes: Array.from(data.sizes),
          elements: Array.from(data.elements),
          count: data.count,
        };
      })
      .sort((a, b) => b.count - a.count);
  }

  function normalizeFontFamily(fontFamily) {
    return fontFamily.split(",")[0].replace(/['"]/g, "").trim();
  }

  function highlightColor(
    color,
    enableScroll = true,
    scrollBehavior = { behavior: "smooth", block: "center" },
    highlightColor = "yellow"
  ) {
    removeHighlight();

    const elements = [...document.querySelectorAll("*")];
    let firstMatchScrolled = false;
    elements.forEach((el) => {
      const style = getComputedStyle(el);
      const tagName = el.tagName.toLowerCase();
      const colorMatch = style.color === color;
      const bgMatch = style.backgroundColor === color;
      const borderMatch = style.borderColor === color;
      if (
        (colorMatch || bgMatch || borderMatch) &&
        tagName !== "html" &&
        tagName !== "body"
      ) {
        el.dataset.originalColor = el.style.color || "";
        el.dataset.originalOutline = el.style.outline || "";
        el.dataset.originalBoxShadow = el.style.boxShadow || "";
        el.dataset.originalAnimation = el.style.animation || "";
        el.dataset.originalBorder = el.style.border || "";
        el.dataset.originalTextShadow = el.style.textShadow || "";
        if (colorMatch) {
          el.style.setProperty("color", highlightColor, "important");
          el.style.setProperty(
            "text-shadow",
            `0 0 10px ${highlightColor}`,
            "important"
          );
        } else {
          if (bgMatch) {
            el.style.setProperty(
              "outline",
              `3px solid ${highlightColor}`,
              "important"
            );
          }
          if (borderMatch) {
            el.style.setProperty(
              "border",
              `3px solid ${highlightColor}`,
              "important"
            );
          }
          el.style.setProperty("--pulse-color", highlightColor);
          el.style.setProperty(
            "box-shadow",
            `0 0 15px ${highlightColor}`,
            "important"
          );
        }
        el.setAttribute("data-highlighted", "true");
        if (enableScroll && !firstMatchScrolled) {
          el.scrollIntoView(scrollBehavior);
          firstMatchScrolled = true;
        }
      }
    });
  }

  function removeHighlight() {
    const highlightedElements = document.querySelectorAll(
      "[data-highlighted='true']"
    );
    highlightedElements.forEach((el) => {
      if (el.dataset.originalColor !== undefined) {
        el.style.color = el.dataset.originalColor;
        delete el.dataset.originalColor;
      }
      if (el.dataset.originalOutline !== undefined) {
        el.style.outline = el.dataset.originalOutline;
        delete el.dataset.originalOutline;
      }
      if (el.dataset.originalBoxShadow !== undefined) {
        el.style.boxShadow = el.dataset.originalBoxShadow;
        delete el.dataset.originalBoxShadow;
      }
      if (el.dataset.originalAnimation !== undefined) {
        el.style.animation = el.dataset.originalAnimation;
        delete el.dataset.originalAnimation;
      }
      if (el.dataset.originalBorder !== undefined) {
        el.style.border = el.dataset.originalBorder;
        delete el.dataset.originalBorder;
      }
      if (el.dataset.originalTextShadow !== undefined) {
        el.style.textShadow = el.dataset.originalTextShadow;
        delete el.dataset.originalTextShadow;
      }
      el.removeAttribute("data-highlighted");
      el.style.removeProperty("--pulse-color");
    });
  }
})();
