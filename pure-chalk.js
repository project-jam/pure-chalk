(function (global) {
  // Logger class
  class Logger {
    constructor(name, color = "white") {
      this.name = name;
      this.color = color;
    }

    static makeTitle(color, title) {
      return [
        "%c %c %s ",
        "",
        `background: ${color}; color: black; font-weight: bold; border-radius: 5px;`,
        title,
      ];
    }

    static bigText(text, color = "#94d05f", shadow = true) {
      console.log(
        `%c${text}`,
        `
                color: ${color};
                font-size: 50px;
                font-weight: bold;
                -webkit-text-stroke: 1px black;
                ${shadow ? "text-shadow: 3px 3px 0 #000;" : ""}
                `,
      );
    }

    _log(level, levelColor, args, customFmt = "") {
      console[level](
        `%c Pearify %c %c ${this.name} ${customFmt}`,
        `background: #94d05f; color: black; font-weight: bold; border-radius: 5px;`,
        "",
        `background: ${this.color}; color: black; font-weight: bold; border-radius: 5px;`,
        ...args,
      );
    }

    log(...args) {
      this._log("log", "#94d05f", args);
    }
    info(...args) {
      this._log("info", "#94d05f", args);
    }
    error(...args) {
      this._log("error", "#ff6b6b", args);
    }
    warn(...args) {
      this._log("warn", "#ffd93d", args);
    }
    debug(...args) {
      this._log("debug", "#4dabf7", args);
    }

    errorCustomFmt(fmt, ...args) {
      this._log("error", "#ff6b6b", args, fmt);
    }
  }

  // ChalkChain class
  class ChalkChain {
    constructor(styles = []) {
      this.styles = styles;
      this.shadowEnabled = true; // Default shadow state
    }

    _build(...text) {
      const message = text.join(" ");
      const css = this.styles
        .map((style) =>
          Object.entries(style)
            .map(([key, value]) => {
              const cssKey = key.replace(
                /[A-Z]/g,
                (m) => `-${m.toLowerCase()}`,
              );
              return `${cssKey}:${value}`;
            })
            .join(";"),
        )
        .join(";");

      return [`%c${message}`, css];
    }

    bind() {
      const f = (...args) => this._build(...args);
      Object.setPrototypeOf(f, Object.getPrototypeOf(this));
      Object.defineProperties(f, Object.getOwnPropertyDescriptors(this));
      f.styles = this.styles;
      f.shadowEnabled = this.shadowEnabled;
      return f;
    }

    // Method to toggle text shadow
    enableShadow() {
      this.shadowEnabled = true;
      return this.bind();
    }

    disableShadow() {
      this.shadowEnabled = false;
      return this.bind();
    }

    big(...text) {
      const message = text.join(" ");
      const currentStyles = this.styles
        .map((style) =>
          Object.entries(style)
            .map(([key, value]) => `${key}:${value}`)
            .join(";"),
        )
        .join(";");

      return [
        `%c${message}`,
        `${currentStyles};
                font-size: 50px;
                font-weight: bold;
                -webkit-text-stroke: 1px black;
                ${this.shadowEnabled ? "text-shadow: 3px 3px 0 #000;" : ""}`,
      ];
    }

    // Method for custom colors
    custom(color) {
      const newChain = new ChalkChain([...this.styles, { color: color }]);
      newChain.shadowEnabled = this.shadowEnabled;
      return newChain.bind();
    }

    // Method for custom background colors
    customBg(color) {
      const newChain = new ChalkChain([
        ...this.styles,
        { backgroundColor: color },
      ]);
      newChain.shadowEnabled = this.shadowEnabled;
      return newChain.bind();
    }
  }

  // Create chalk function
  function createChalk() {
    const chalk = new ChalkChain().bind();

    const colors = {
      black: "#000000",
      red: "#ff6b6b",
      green: "#94d05f",
      yellow: "#ffd93d",
      blue: "#4dabf7",
      magenta: "#ff75c3",
      cyan: "#67e8f9",
      white: "#ffffff",
      gray: "#808080",
      grey: "#808080",
    };

    Object.entries(colors).forEach(([name, hex]) => {
      Object.defineProperty(ChalkChain.prototype, name, {
        get() {
          const newChain = new ChalkChain([...this.styles, { color: hex }]);
          newChain.shadowEnabled = this.shadowEnabled;
          return newChain.bind();
        },
      });
    });

    Object.entries(colors).forEach(([name, hex]) => {
      Object.defineProperty(
        ChalkChain.prototype,
        `bg${name.charAt(0).toUpperCase()}${name.slice(1)}`,
        {
          get() {
            const newChain = new ChalkChain([
              ...this.styles,
              { backgroundColor: hex },
            ]);
            newChain.shadowEnabled = this.shadowEnabled;
            return newChain.bind();
          },
        },
      );
    });

    const modifiers = {
      bold: { fontWeight: "bold" },
      dim: { opacity: "0.5" },
      italic: { fontStyle: "italic" },
      underline: { textDecoration: "underline" },
      strikethrough: { textDecoration: "line-through" },
      reset: {},
    };

    Object.entries(modifiers).forEach(([name, style]) => {
      Object.defineProperty(ChalkChain.prototype, name, {
        get() {
          const newChain = new ChalkChain([...this.styles, style]);
          newChain.shadowEnabled = this.shadowEnabled;
          return newChain.bind();
        },
      });
    });

    ChalkChain.prototype.rgb = function (r, g, b) {
      const newChain = new ChalkChain([
        ...this.styles,
        { color: `rgb(${r},${g},${b})` },
      ]);
      newChain.shadowEnabled = this.shadowEnabled;
      return newChain.bind();
    };

    ChalkChain.prototype.hex = function (hex) {
      const newChain = new ChalkChain([...this.styles, { color: hex }]);
      newChain.shadowEnabled = this.shadowEnabled;
      return newChain.bind();
    };

    return chalk;
  }

  // Create and expose global objects
  const chalk = createChalk();

  // Expose to global scope
  global.Chalk = {
    Logger,
    chalk,
  };
})(typeof window !== "undefined" ? window : global);
