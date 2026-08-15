/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#080607",
        panel: "#110d0f",
        panel2: "#171113",
        redcinema: "#9f1725",
        redbright: "#c92335"
      },
      boxShadow: {
        red: "0 0 28px rgba(201,35,53,.22)"
      }
    }
  },
  plugins: []
};
