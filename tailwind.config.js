/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      cursor: {
        'pencil': 'url("/assets/cursors/pencil.svg"), pointer',
        'eraser': 'url("/assets/cursors/eraser.svg"), pointer'
      },
    },
    colors:{
      background: '#ffff',
      backgroundDark: '#000',
      border: '#b8b8b8',
      borderDark: '#3d3d3d',
      text:"#000",
      textDark: "#fff"

    }

  },
  plugins: [],
}