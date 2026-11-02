
document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. PERFILES DE TATUADORES
    // ==========================================

    const artistProfiles = {
        "Alex Ramírez": {
            description: "Especialista en tatuajes realistas y retratos. Su trabajo se caracteriza por los detalles y las sombras."
        },
        "Sofía Chen": {
            description: "Especialista en tatuajes minimalistas y fine line. Sus diseños son delicados y elegantes."
        },
        "Dmitri Volkov": {
            description: "Especialista en tatuajes tradicionales y blackwork. Sus diseños destacan por sus líneas marcadas."
        }
    };

    const profileButtons = document.querySelectorAll(".profile-btn");
    const artistModalTitle = document.getElementById("artistModalTitle");
    const artistModalBody = document.getElementById("artistModalBody");
    const artistModalElement = document.getElementById("artistModal");

    profileButtons.forEach(function (button) {
        button.addEventListener("click", function () {

            const artistName = button.getAttribute("data-artist");

            if (artistModalTitle && artistModalBody) {
                artistModalTitle.textContent = artistName;

                const profile = artistProfiles[artistName];

                artistModalBody.textContent = profile
                    ? profile.description
                    : "Este tatuador cuenta con experiencia y diferentes estilos de tatuaje. Consulta su perfil para conocer más sobre su trabajo.";
            }

            if (artistModalElement && typeof bootstrap !== "undefined") {
                const modal = new bootstrap.Modal(artistModalElement);
                modal.show();
            }
        });
    });


    // ==========================================
    // 2. FORMULARIO DE DISEÑO PERSONALIZADO
    // ==========================================

    const designForm = document.getElementById("designForm");

    if (designForm) {

        designForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const clientName = document.getElementById("clientName");
            const clientEmail = document.getElementById("clientEmail");
            const designStyle = document.getElementById("designStyle");
            const designArtist = document.getElementById("designArtist");
            const bodyZone = document.getElementById("bodyZone");
            const designSize = document.getElementById("designSize");
            const designDescription = document.getElementById("designDescription");
            const designReference = document.getElementById("designReference");

            const formMessage =
                document.getElementById("formMessage") ||
                document.getElementById("designMessage");

            if (!designForm.checkValidity()) {
                designForm.reportValidity();
                return;
            }

            if (
                !clientName ||
                !clientEmail ||
                !designStyle ||
                !designArtist ||
                !bodyZone ||
                !designSize ||
                !designDescription
            ) {
                if (formMessage) {
                    formMessage.textContent =
                        "No se encontraron todos los campos del formulario. Revisa los identificadores HTML.";
                    formMessage.className = "alert alert-danger mt-3";
                }
                return;
            }

            const name = clientName.value.trim();

            if (formMessage) {
                formMessage.textContent =
                    "¡Gracias, " + name + "! Tu solicitud de diseño personalizado se registró correctamente. Nos pondremos en contacto contigo para continuar con tu idea.";

                formMessage.className = "alert alert-success mt-3";
            }

            designForm.reset();
        });

    }


    // ==========================================
    // 3. BUSCADOR DE ESTUDIOS DE TATUAJES
    // ==========================================

    const locationForm = document.getElementById("locationForm");

    if (locationForm) {

        locationForm.addEventListener("submit", async function (event) {
            event.preventDefault();

            const locationInput = document.getElementById("locationInput");
            const locationMessage = document.getElementById("locationMessage");
            const locationDetails = document.getElementById("locationDetails");
            const mapLink = document.getElementById("mapLink");
            const mapFrame = document.getElementById("mapFrame");

            const location = locationInput.value.trim();

            if (!location) {
                locationMessage.textContent = "Ingresa una ubicación para continuar.";
                locationMessage.className = "alert alert-warning mt-3";
                return;
            }

            locationMessage.textContent = "Buscando estudios de tatuajes cercanos...";
            locationMessage.className = "alert alert-info mt-3";

            if (locationDetails) {
                locationDetails.innerHTML = "";
            }

            try {

                // Buscar las coordenadas de la ubicación

                const geocodingURL =
                    "https://nominatim.openstreetmap.org/search?format=json&q=" +
                    encodeURIComponent(location);

                const geocodingResponse = await fetch(geocodingURL);

                if (!geocodingResponse.ok) {
                    throw new Error("No se pudo consultar la ubicación.");
                }

                const geocodingData = await geocodingResponse.json();

                if (geocodingData.length === 0) {
                    locationMessage.textContent =
                        "No se encontró esa ubicación. Intenta con otra dirección o ciudad.";

                    locationMessage.className = "alert alert-warning mt-3";
                    return;
                }

                const latitude = Number(geocodingData[0].lat);
                const longitude = Number(geocodingData[0].lon);

                // Mostrar el mapa de la ubicación

                if (mapFrame) {
                    mapFrame.src =
                        "https://www.openstreetmap.org/export/embed.html?bbox=" +
                        (longitude - 0.15) + "%2C" +
                        (latitude - 0.15) + "%2C" +
                        (longitude + 0.15) + "%2C" +
                        (latitude + 0.15) +
                        "&layer=mapnik&marker=" +
                        latitude + "%2C" + longitude;
                }

                if (mapLink) {
                    mapLink.href =
                        "https://www.google.com/maps/search/estudios+de+tatuajes+en+" +
                        encodeURIComponent(location);

                    mapLink.target = "_blank";
                    mapLink.textContent = "Ver ubicación en Google Maps";
                }

                // Buscar estudios de tatuajes en un radio de 15 km

                const overpassQuery = `
                    [out:json][timeout:25];
                    (
                        nwr["shop"="tattoo"](around:15000,${latitude},${longitude});
                        nwr["craft"="tattoo"](around:15000,${latitude},${longitude});
                    );
                    out center tags;
                `;

                const overpassServers = [
                    "https://overpass-api.de/api/interpreter",
                    "https://overpass.kumi.systems/api/interpreter"
                ];

                let studiosData = null;

                for (const server of overpassServers) {
                    try {
                        const response = await fetch(server, {
                            method: "POST",
                            body: overpassQuery,
                            headers: {
                                "Content-Type": "text/plain"
                            }
                        });

                        if (response.ok) {
                            studiosData = await response.json();
                            break;
                        }
                    } catch (error) {
                        console.log("Servidor de búsqueda no disponible:", server);
                    }
                }

                if (!studiosData) {
                    throw new Error("No se pudo conectar con el servicio de búsqueda de estudios.");
                }

                const studios = studiosData.elements || [];

                if (studios.length === 0) {

                    locationMessage.textContent =
                        "No encontramos estudios registrados en esa zona. Puedes consultar Google Maps para ver otras opciones.";

                    locationMessage.className = "alert alert-warning mt-3";

                    if (locationDetails) {
                        locationDetails.textContent =
                            "No hay estudios disponibles en los datos consultados. Esto no significa que no existan estudios en la zona.";
                    }

                    return;
                }

                // Mostrar resultados

                locationMessage.textContent =
                    "Encontramos " + studios.length + " estudios de tatuajes cercanos.";

                locationMessage.className = "alert alert-success mt-3";

                if (locationDetails) {

                    locationDetails.innerHTML = "";

                    studios.forEach(function (studio) {

                        const tags = studio.tags || {};

                        const studioName =
                            tags.name || "Estudio de tatuajes";

                        const address = [
                            tags["addr:street"],
                            tags["addr:housenumber"],
                            tags["addr:suburb"],
                            tags["addr:city"]
                        ].filter(Boolean).join(", ");

                        const studioLatitude =
                            studio.lat || (studio.center && studio.center.lat);

                        const studioLongitude =
                            studio.lon || (studio.center && studio.center.lon);

                        const card = document.createElement("div");

                        card.className = "card mb-3";

                        const cardBody = document.createElement("div");
                        cardBody.className = "card-body";

                        const title = document.createElement("h5");
                        title.className = "card-title";
                        title.textContent = studioName;

                        const addressText = document.createElement("p");
                        addressText.className = "card-text";
                        addressText.textContent =
                            address || "Dirección no disponible";

                        const mapsButton = document.createElement("a");
                        mapsButton.className = "btn btn-outline-primary";
                        mapsButton.textContent = "Ver en Google Maps";
                        mapsButton.href =
                            "https://www.google.com/maps/search/?api=1&query=" +
                            studioLatitude + "," + studioLongitude;

                        mapsButton.target = "_blank";
                        mapsButton.rel = "noopener noreferrer";

                        cardBody.appendChild(title);
                        cardBody.appendChild(addressText);
                        cardBody.appendChild(mapsButton);

                        card.appendChild(cardBody);

                        locationDetails.appendChild(card);
                    });
                }

            } catch (error) {

                console.error("Error al buscar estudios:", error);

                locationMessage.textContent =
                    "Ocurrió un problema al buscar los estudios. Intenta nuevamente más tarde.";

                locationMessage.className = "alert alert-danger mt-3";
            }

        });

    }


    // ==========================================
    // 4. CERRAR MENÚ DE NAVEGACIÓN EN MÓVILES
    // ==========================================

    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    const navbarCollapse = document.querySelector(".navbar-collapse");

    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            if (
                navbarCollapse &&
                navbarCollapse.classList.contains("show") &&
                typeof bootstrap !== "undefined"
            ) {
                const collapse = bootstrap.Collapse.getOrCreateInstance(navbarCollapse);
                collapse.hide();
            }

        });

    });


    // ==========================================
    // 5. SELECCIÓN AUTOMÁTICA DE ESTILO Y TATUADOR
    // ==========================================

    const urlParams = new URLSearchParams(window.location.search);

    const selectedStyle = urlParams.get("estilo");
    const selectedArtist = urlParams.get("artista");

    const styleSelect = document.getElementById("designStyle");
    const artistSelect = document.getElementById("designArtist");

    if (selectedStyle && styleSelect) {
        styleSelect.value = selectedStyle;
    }

    if (selectedArtist && artistSelect) {
        artistSelect.value = selectedArtist;
    }

});
