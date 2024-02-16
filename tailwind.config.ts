import withMT from "@material-tailwind/react/utils/withMT";
import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

export default withMT({
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: {
        hero: "url('/img/hero.jpeg')",
      },
      fontFamily: {
        sans: ["Roboto", ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [],
} satisfies Config);
