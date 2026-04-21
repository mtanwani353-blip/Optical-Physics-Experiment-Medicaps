Optical Physics Lab - Static Build
====================================

This folder contains a fully built web application. To run it on any PC:

OPTION 1 (Easiest - requires Node.js):
   1. Open a terminal in this folder
   2. Run:  npx serve .
   3. Open the URL it prints (usually http://localhost:3000)

OPTION 2 (Requires Python, pre-installed on Mac/Linux):
   1. Open a terminal in this folder
   2. Run:  python3 -m http.server 8000
      (or on Windows:  python -m http.server 8000)
   3. Open http://localhost:8000 in a browser

OPTION 3 (Host online for free):
   - Drag this whole folder onto https://app.netlify.com/drop
   - You'll get a public URL instantly

NOTE: Modern browsers block ES modules from being loaded directly via
file:// (i.e. just double-clicking index.html will NOT work). You need
a small local server. The options above all work.
