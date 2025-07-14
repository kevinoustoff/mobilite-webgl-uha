<h1><span class="emoji">🚗</span> Mobility Traffic Visualization (Urban Vehicle Density in 3D)</h1>

  <p>
    Welcome to this web application showcasing a 3D simulation and visualization tool for urban traffic.
    The project allows real-time analysis of vehicle density in French cities, broken down by IRIS zones, which are statistical units defined by INSEE.
    Each city in France is divided into IRIS sectors, and the app highlights areas with higher simulated traffic loads, making it easy to visualize congestion and movement patterns.
  </p>

  <p>
    The application is live at
    <a href="https://projet-mobilite-uha.web.app" target="_blank">projet-mobilite-uha.web.app</a>,
    and the full source code is available at
    <a href="https://github.com/kevinoustoff/mobilite-webgl-uha" target="_blank">github.com/kevinoustoff/mobilite-webgl-uha</a>.
  </p>

  <p>
    Technically, this project is built entirely with JavaScript. MapboxGL.js handles the 3D rendering and map interaction, while simulated vehicle movements are generated using OSMRouter.
    The geographic structure is based on INSEE’s IRIS zones, integrated via a REST API.
    Vehicles are displayed as 3D cubes, positioned in real time within the urban map. The entire application is hosted on Firebase for simplicity and accessibility.
  </p>

  <p>
    This platform, while based on simulated traffic, offers real-world potential.
    It can serve as a tool for fleet monitoring, emergency vehicle routing simulations, urban planning support, and even educational use in optimization and AI research.
    It also has the potential to serve as a digital twin framework for smart cities or logistics simulations.
  </p>

