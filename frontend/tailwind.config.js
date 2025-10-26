/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#bad5b7",
                secondary: "#a8c9a3",
                dark: "#1a1a1a",
                graylight: "#bbbbbb",
            },
        },
    },
    plugins: [],
};