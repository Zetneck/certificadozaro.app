    let zoomLevel = 0.6;

    function actualizarCampos() {
      const inicio = document.getElementById("vigencia_inicio").value;
      const fin = document.getElementById("vigencia_fin").value;
      document.getElementById("folio_out").textContent = document.getElementById("folio").value;
      document.getElementById("remolque_out").textContent = document.getElementById("remolque").value;
      document.getElementById("placas_out").textContent = document.getElementById("placas").value;
      document.getElementById("vigencia_out").textContent = (inicio && fin) ? `${inicio} AL ${fin}` : "";
    }

    function mostrarError(msg) {
      const errorDiv = document.getElementById("error-msg");
      if (errorDiv) errorDiv.textContent = msg;
    }

    function validarCampos() {
      const errorDiv = document.getElementById("error-msg");
      if (errorDiv) errorDiv.textContent = "";

      const campos = ["folio", "remolque", "placas", "vigencia_inicio", "vigencia_fin"];
      for (const id of campos) {
        if (!document.getElementById(id).value) {
          mostrarError("Completa todos los campos obligatorios.");
          return false;
        }
      }

      const inicio = document.getElementById("vigencia_inicio").value;
      const fin = document.getElementById("vigencia_fin").value;
      const iDate = new Date(inicio.split("/").reverse().join("/"));
      const fDate = new Date(fin.split("/").reverse().join("/"));
      if (iDate > fDate) {
        mostrarError("La fecha de inicio debe ser anterior a la de fin.");
        return false;
      }

      return true;
    }

    function generarPDF() {
      if (!validarCampos()) return;
      actualizarCampos();
      setTimeout(() => {
        const element = document.getElementById("certificate");
        const remolque = document.getElementById("remolque").value || "certificado";
        const opt = {
          margin: 0,
          filename: `Certificado ${remolque}.pdf`,
          image: { type: 'jpeg', quality: 1 },
          html2canvas: { scale: 3, useCORS: true },
          jsPDF: { unit: 'px', format: [1800, 1273], orientation: 'landscape' }
        };
        html2pdf().set(opt).from(element).save();
      }, 100);
    }

    function ajustarZoom(delta) {
      const container = document.getElementById("certificate-container");
      container.classList.add("zooming");

      zoomLevel += delta;
      if (zoomLevel < 0.3) zoomLevel = 0.3;
      if (zoomLevel > 1.5) zoomLevel = 1.5;
      container.style.transform = `scale(${zoomLevel})`;

      setTimeout(() => container.classList.remove("zooming"), 300);
    }

    document.addEventListener("DOMContentLoaded", () => {
      const posicionesGuardadas = JSON.parse(localStorage.getItem("posicionesCampos")) || {};
      document.querySelectorAll(".text-field").forEach(el => {
        const id = el.id;
        if (posicionesGuardadas[id]) {
          el.style.left = posicionesGuardadas[id].left;
          el.style.top = posicionesGuardadas[id].top;
        }
      });

      flatpickr("#vigencia_inicio", {
        dateFormat: "d/m/Y",
        locale: "es",
        onChange: actualizarCampos
      });
      flatpickr("#vigencia_fin", {
        dateFormat: "d/m/Y",
        locale: "es",
        onChange: actualizarCampos
      });
      ["folio", "remolque", "placas"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          el.addEventListener("input", () => {
            actualizarCampos();
          });
        }
      });
      document.querySelectorAll(".text-field").forEach(el => {
        el.addEventListener('mousedown', (e) => {
          let offsetX = e.clientX - el.offsetLeft;
          let offsetY = e.clientY - el.offsetTop;
          function onMouseMove(e) {
            el.style.left = `${e.clientX - offsetX}px`;
            el.style.top = `${e.clientY - offsetY}px`;
          }
          function onMouseUp() {
  // Guardar posición en localStorage
  const id = el.id;
  const left = el.style.left;
  const top = el.style.top;
  const posiciones = JSON.parse(localStorage.getItem("posicionesCampos")) || {};
  posiciones[id] = { left, top };
  localStorage.setItem("posicionesCampos", JSON.stringify(posiciones));
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
          }
          document.addEventListener('mousemove', onMouseMove);
          document.addEventListener('mouseup', onMouseUp);
        });
      });
    });
