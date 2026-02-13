/** @type {import('tailwindcss').Config} */
export default {
  // Aquí le decimos a Tailwind qué archivos observar
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Configuramos las fuentes para que coincidan con tu diseño elegante
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
