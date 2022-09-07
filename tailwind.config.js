module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    fontFamily: {
      sans: ["IBM Plex Sans", "Arial", "system-ui"],
    },
    extend: {
      animation: {
        blob: "blob 9s infinite",
        fadeindown: "fadeindown 1s ease-out",
        fadeout: "fadeout 3s ease-out 1",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(40px, -60px) scale(1.3)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.7)",
          },
          "100%": {
            transform: "tranlate(0px, 0px) scale(1)",
          },
        },
        fadeindown: {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        fadeout: {
          "0%": {
            opacity: "1",
          },
          "85%": {
            opacity: "1",
          },
          "100%": {
            opacity: "0",
          },
        },
      },
    },
  },
  plugins: [],
};
