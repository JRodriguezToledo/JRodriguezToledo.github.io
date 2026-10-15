# Portfolio: Jorge Rodríguez Toledo

Static site, no build step. Open `index.html` through any web server (fonts need http, not file://):

    python3 -m http.server 8767 --directory portfolio      # run from the Trabajar folder

Files
- `index.html`, `css/style.css`: content and design. Edit the text directly in index.html.
- `js/main.js`: hero entrance (GSAP) and the sector-occupancy simulator (illustrative, labelled as such).
- `js/fluid.js`: fluid simulation adapted from PavelDoGreat/WebGL-Fluid-Simulation (MIT, see LICENSE-fluid.txt).
- `js/gsap.min.js`: GSAP 3.12.5 (https://gsap.com/standard-license). `fonts/`: Bricolage Grotesque and Public Sans (SIL Open Font License).

Publishing (not done yet, needs your OK): create a GitHub repo named `JRodriguezToledo.github.io`, push the contents of this folder to it, and enable GitHub Pages (branch main, root). The site would be at https://jrodriguezToledo.github.io

Before publishing, check: no phone number or photo on the site (only the email), and that every claim matches your CV.
