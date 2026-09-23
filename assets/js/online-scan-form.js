(function () {
  const INSTALLER_URL = "https://github.com/TheSmartScanner/TheSmartScanner.github.io/releases/latest/download/SmartScanner-Setup-x64.exe";

  function createDownloadModal() {
    const modal = document.createElement("div");
    modal.id = "downloadModal";
    modal.className = "fixed inset-0 z-[1000] hidden place-items-center bg-slate-900/40 p-5 backdrop-blur-[8px]";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "downloadModalTitle");
    modal.innerHTML = `
      <div class="relative w-full max-w-[480px] rounded-[18px] border border-slate-200 bg-white p-8 text-center shadow-[0_30px_100px_rgba(15,23,42,.18)]" tabindex="-1">
        <button class="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-lg border-0 bg-transparent text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" id="closeModalButton" type="button" aria-label="Close download dialog">&times;</button>
        <div id="step1">
          <h3 class="mb-3 pr-8 text-[25px] font-bold" id="downloadModalTitle">SmartScanner is required</h3>
          <p class="mb-[25px] text-sm">SmartScanner runs the security scan locally on your computer. Download the application to continue your scan.</p>
          <a class="mb-3 block rounded-[9px] bg-brand p-3.5 font-bold text-white hover:text-white transition hover:bg-brand-800"
            href="${INSTALLER_URL}" id="downloadButton">Download SmartScanner</a>
          <button class="border-0 bg-transparent text-slate-500 text-xs transition hover:text-slate-700"
            id="continueButton1" type="button">I have installed SmartScanner</button>
        </div>
        <div id="step2" class="hidden">
          <h3 class="mb-3 text-[25px] font-bold">Downloading SmartScanner...</h3>
          <ol class="list-decimal pl-5 space-y-2 text-left text-sm mb-[25px]">
            <li>Find <i>SmartScanner-Setup-x64</i> in your download folder</li>
            <li>Run the installer and follow instructions</li>
          </ol>
          <button class="mb-3 block w-full rounded-[9px] bg-brand p-3.5 font-bold text-white transition hover:bg-brand-800"
            id="continueButton2" type="button">I have installed SmartScanner</button>
          <a class="border-0 bg-transparent text-slate-500 text-xs transition hover:text-slate-700"
            id="installComplete" href="${INSTALLER_URL}">Download didn't start</a>
        </div>
      </div>`;

    document.body.appendChild(modal);
    return modal;
  }

  function validateUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  function makeOnlineScanForm(ids) {
    const form = document.getElementById(ids.form);
    const input = document.getElementById(ids.input);
    const button = document.getElementById(ids.button);
    const status = document.getElementById(ids.status);

    if (!form || !input || !button || !status) {
      throw new Error("makeOnlineScanForm could not find one or more configured elements");
    }

    const modal = createDownloadModal();
    const step1 = modal.querySelector("#step1");
    const step2 = modal.querySelector("#step2");
    const downloadButton = modal.querySelector("#downloadButton");
    const continueButton1 = modal.querySelector("#continueButton1");
    const continueButton2 = modal.querySelector("#continueButton2");
    const closeModalButton = modal.querySelector("#closeModalButton");
    let previouslyFocused;
    let previousOverflow;

    function openModal(step) {
      previouslyFocused = document.activeElement;
      previousOverflow = document.body.style.overflow;
      modal.classList.remove("hidden");
      modal.classList.add("active");
      modal.classList.add("grid");
      document.body.style.overflow = "hidden";
      step1.classList.toggle("hidden", step !== 1);
      step1.classList.toggle("active", step === 1);
      step2.classList.toggle("hidden", step !== 2);
      step2.classList.toggle("active", step === 2);
      window.requestAnimationFrame(function () {
        (step === 1 ? downloadButton : continueButton2).focus();
      });
    }

    function closeModal() {
      modal.classList.remove("active");
      modal.classList.remove("grid");
      modal.classList.add("hidden");
      document.body.style.overflow = previousOverflow || "";
      if (previouslyFocused && typeof previouslyFocused.focus === "function") {
        previouslyFocused.focus();
      }
    }

    function launchSmartScanner(url) {
      window.location.href = "smartscanner://scan?" + encodeURIComponent(url);
    }

    function tryInstalledApp() {
      closeModal();
      const url = input.value.trim();

      if (!validateUrl(url)) {
        status.textContent = "Please enter a valid website URL, for example https://example.com";
        status.classList.remove("hidden");
        return;
      }

      status.classList.add("hidden");
      button.disabled = true;
      const originalButtonText = button.textContent;
      button.textContent = "Launching...";
      launchSmartScanner(url);

      window.setTimeout(function () {
        button.disabled = false;
        button.textContent = originalButtonText;
        openModal(1);
      }, 2500);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      tryInstalledApp();
    });

    downloadButton.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = INSTALLER_URL;
      openModal(2);
    });
    continueButton1.addEventListener("click", tryInstalledApp);
    continueButton2.addEventListener("click", tryInstalledApp);
    closeModalButton.addEventListener("click", closeModal);
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        closeModal();
      }
    });
    modal.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key === "Tab") {
        const focusable = modal.querySelectorAll("a[href], button:not([disabled])");
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    return { close: closeModal };
  }

  window.makeOnlineScanForm = makeOnlineScanForm;
})();
