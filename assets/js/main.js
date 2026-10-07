/* ==========================================================================
   Nexus Cristão — interações
   Cada recurso é uma função init* independente: se o elemento não existe
   na página, ela simplesmente não faz nada.
   ========================================================================== */

(() => {
  "use strict";

  const doc = document;
  const $ = (sel, ctx = doc) => ctx.querySelector(sel);
  const $$ = (sel, ctx = doc) => Array.from(ctx.querySelectorAll(sel));

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

  const CHECKOUT_URL = "https://pay.kiwify.com.br/jLZNiTk";
  const STORAGE_KEY = "nexus:trilha";
  const RECO_DISMISSED_KEY = "nexus:reco-dismissed";

  // localStorage pode falhar (aba anônima, bloqueio de cookies): nunca quebra a página
  const store = (area) => ({
    get(key) {
      try {
        return JSON.parse(window[area].getItem(key));
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        window[area].setItem(key, JSON.stringify(value));
      } catch {
        /* sem armazenamento: segue sem salvar */
      }
    },
    remove(key) {
      try {
        window[area].removeItem(key);
      } catch {
        /* idem */
      }
    },
  });
  const local = store("localStorage");
  const session = store("sessionStorage");

  /* ---------- Conteúdo ---------- */

  const MODULES = {
    startup: { title: "Start UP", img: "assets/img/curso-startup.jpg" },
    imersao: { title: "Imersão e Visão", img: "assets/img/curso-imersao.jpg" },
    alicerces: { title: "Alicerces da Nossa Fé", img: "assets/img/curso-alicerces.jpg" },
    intencionalidade: { title: "Intencionalidade Ativa", img: "assets/img/curso-intencionalidade.jpg" },
    "cultura-igreja": { title: "Cultura da Igreja", img: "assets/img/curso-cultura-igreja.jpg" },
    satisfacao: { title: "Curso de Satisfação", img: "assets/img/curso-satisfacao.jpg" },
  };

  const QUIZ = [
    {
      question: "Como você descreveria a sua caminhada hoje?",
      options: [
        { label: "Estou começando agora", value: "inicio" },
        { label: "Caminho, mas sinto que estagnei", value: "constancia" },
        { label: "Sirvo na igreja e quero ir mais fundo", value: "visao" },
        { label: "Quero voltar ao primeiro amor", value: "recomeco" },
      ],
    },
    {
      question: "O que você mais busca neste momento?",
      options: [
        { label: "Bases firmes na Palavra", value: "inicio" },
        { label: "Constância e disciplina espiritual", value: "constancia" },
        { label: "Entender a visão e a cultura da igreja", value: "visao" },
        { label: "Restauração e alegria em Deus", value: "recomeco" },
      ],
    },
    {
      question: "O que mais tem impedido o seu crescimento?",
      options: [
        { label: "Não sei por onde começar", value: "inicio" },
        { label: "Falta de rotina com Deus", value: "constancia" },
        { label: "Não sei qual é o meu lugar na igreja", value: "visao" },
        { label: "Cansaço e desânimo", value: "recomeco" },
      ],
    },
  ];

  const PROFILES = {
    inicio: {
      title: "Firmar os alicerces",
      text: "Você está no começo de algo grande. O melhor caminho é entender a trilha e construir bases firmes na Palavra, um passo de cada vez.",
      next: "alicerces",
    },
    constancia: {
      title: "Viver com intencionalidade",
      text: "Você já conhece o caminho e agora quer constância. A trilha vai ajudar a transformar boas intenções em hábitos espirituais diários.",
      next: "intencionalidade",
    },
    visao: {
      title: "Enxergar mais longe",
      text: "Você quer servir com propósito. Entender a visão e a cultura da casa vai alinhar o seu chamado ao que Deus está construindo na igreja.",
      next: "cultura-igreja",
    },
    recomeco: {
      title: "Renovar a alegria",
      text: "Deus quer restaurar o seu primeiro amor. Recomece com direção e deixe a trilha conduzir você de volta à alegria da presença dEle.",
      next: "satisfacao",
    },
  };

  const VERSES = [
    { text: "Lâmpada para os meus pés é a tua palavra, e luz para o meu caminho.", ref: "Salmos 119:105" },
    { text: "E não vos conformeis com este século, mas transformai-vos pela renovação da vossa mente.", ref: "Romanos 12:2" },
    { text: "E conhecereis a verdade, e a verdade vos libertará.", ref: "João 8:32" },
    { text: "Chegai-vos a Deus, e ele se chegará a vós.", ref: "Tiago 4:8" },
    { text: "Antes, crescei na graça e no conhecimento de nosso Senhor e Salvador Jesus Cristo.", ref: "2 Pedro 3:18" },
    { text: "Tornai-vos, pois, praticantes da palavra e não somente ouvintes.", ref: "Tiago 1:22" },
    { text: "Mas os que esperam no Senhor renovarão as suas forças.", ref: "Isaías 40:31" },
    { text: "Buscai, pois, em primeiro lugar, o seu reino e a sua justiça.", ref: "Mateus 6:33" },
    { text: "Tudo posso naquele que me fortalece.", ref: "Filipenses 4:13" },
  ];

  const ICONS = {
    check:
      '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>',
    arrow:
      '<svg class="btn-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="m13 6 6 6-6 6"/></svg>',
    refresh:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>',
    sparkle:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M9.94 15.5A2 2 0 0 0 8.5 14.06l-6.13-1.58a.5.5 0 0 1 0-.96L8.5 9.94A2 2 0 0 0 9.94 8.5l1.58-6.13a.5.5 0 0 1 .96 0l1.58 6.13a2 2 0 0 0 1.44 1.44l6.13 1.58a.5.5 0 0 1 0 .96l-6.13 1.58a2 2 0 0 0-1.44 1.44l-1.58 6.13a.5.5 0 0 1-.96 0z"/></svg>',
  };

  /* ---------- Scroll compartilhado (um único rAF por frame) ---------- */

  const scrollHandlers = [];
  let scrollQueued = false;

  const onScroll = (fn) => {
    scrollHandlers.push(fn);
    fn();
  };

  const flushScroll = () => {
    scrollQueued = false;
    scrollHandlers.forEach((fn) => fn());
  };

  const queueScroll = () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(flushScroll);
  };

  window.addEventListener("scroll", queueScroll, { passive: true });
  window.addEventListener("resize", queueScroll, { passive: true });

  /* ---------- Toasts (fila curta, pausa com hover e aba oculta) ---------- */

  const toast = (() => {
    let host = null;
    const ensureHost = () => {
      if (host) return host;
      host = doc.createElement("div");
      host.className = "toaster";
      host.setAttribute("role", "status");
      host.setAttribute("aria-live", "polite");
      doc.body.append(host);
      return host;
    };

    return (message) => {
      const container = ensureHost();
      const el = doc.createElement("div");
      el.className = "toast";
      el.innerHTML = `${ICONS.check}<span></span>`;
      el.querySelector("span").textContent = message;
      container.append(el);

      while (container.children.length > 3) container.firstElementChild.remove();

      // Dois frames: garante que o estado inicial foi pintado antes da transição
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));

      let remaining = 2600;
      let startedAt = 0;
      let timer = 0;

      const dismiss = () => {
        clearTimeout(timer);
        doc.removeEventListener("visibilitychange", onVisibility);
        el.classList.remove("is-in");
        el.classList.add("is-out");
        setTimeout(() => el.remove(), 220);
      };
      const run = () => {
        startedAt = Date.now();
        clearTimeout(timer);
        timer = setTimeout(dismiss, remaining);
      };
      const pause = () => {
        clearTimeout(timer);
        remaining -= Date.now() - startedAt;
      };
      const onVisibility = () => (doc.hidden ? pause() : run());

      el.addEventListener("pointerenter", pause);
      el.addEventListener("pointerleave", run);
      doc.addEventListener("visibilitychange", onVisibility);
      run();
    };
  })();

  /* ---------- Header: estado de scroll, progresso da trilha, menu mobile ---------- */

  function initHeader() {
    const header = $("[data-header]");
    if (!header) return;

    const bar = $("[data-trail-progress]", header);
    onScroll(() => {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 8);
      if (!bar) return;
      const max = doc.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = `scaleX(${max > 0 ? clamp(y / max, 0, 1) : 0})`;
    });

    const toggle = $("[data-nav-toggle]", header);
    const nav = $("[data-nav]", header);
    if (!toggle || !nav) return;

    Array.from(nav.children).forEach((el, i) => el.style.setProperty("--i", i));

    const isOpen = () => toggle.getAttribute("aria-expanded") === "true";
    const setOpen = (open) => {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    };

    toggle.addEventListener("click", () => setOpen(!isOpen()));
    nav.addEventListener("click", (e) => {
      if (e.target.closest("a")) setOpen(false);
    });
    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });
    doc.addEventListener("pointerdown", (e) => {
      if (isOpen() && !header.contains(e.target)) setOpen(false);
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => {
      if (e.matches) setOpen(false);
    });
  }

  /* ---------- Revelar ao entrar na tela ---------- */

  function initReveal() {
    $$("[data-stagger]").forEach((group) => {
      $$("[data-reveal]", group).forEach((el, i) => {
        if (!el.style.getPropertyValue("--delay")) el.style.setProperty("--delay", `${i * 80}ms`);
      });
    });

    const items = $$("[data-reveal]");
    if (!("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ---------- Hero ---------- */

  function initHeroTitle() {
    const title = $("[data-split]");
    if (!title) return;

    let index = 0;
    const frag = doc.createDocumentFragment();
    Array.from(title.childNodes).forEach((node) => {
      const isAccent = node.nodeType === Node.ELEMENT_NODE;
      const words = node.textContent.split(/\s+/).filter(Boolean);
      if (/^\s/.test(node.textContent) && frag.lastChild) frag.append(doc.createTextNode(" "));
      words.forEach((text, i) => {
        if (i > 0) frag.append(doc.createTextNode(" "));
        const word = doc.createElement("span");
        word.className = isAccent ? "w accent" : "w";
        word.textContent = text;
        word.style.setProperty("--i", index++);
        // Cada palavra do destaque mostra a sua fatia do mesmo gradiente,
        // então ele continua contínuo e o título ainda pode quebrar linha
        if (isAccent && words.length > 1) {
          word.style.backgroundSize = `${words.length * 100}% 100%`;
          word.style.backgroundPosition = `${(i / (words.length - 1)) * 100}% 0`;
        }
        frag.append(word);
      });
      if (/\s$/.test(node.textContent) && words.length) frag.append(doc.createTextNode(" "));
    });
    title.replaceChildren(frag);
    title.classList.add("is-split");
  }

  // Interpolação independente da taxa de quadros (60Hz e 120Hz se comportam igual)
  const smoothing = (base, dt) => 1 - Math.pow(1 - base, dt / 16.67);

  function initHeroLight() {
    const hero = $("[data-hero]");
    const light = hero && $("[data-hero-light]", hero);
    if (!light) return;

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let last = 0;

    const home = () => {
      tx = hero.clientWidth * 0.74;
      ty = hero.clientHeight * 0.32;
    };
    const render = () => {
      light.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };

    home();
    x = tx;
    y = ty;
    render();
    light.classList.add("is-on");

    if (reducedMotion.matches || !finePointer.matches) return;

    const tick = (now) => {
      const dt = last ? Math.min(now - last, 64) : 16.67;
      last = now;
      const k = smoothing(0.07, dt);
      x = lerp(x, tx, k);
      y = lerp(y, ty, k);
      render();
      if (Math.abs(tx - x) > 0.4 || Math.abs(ty - y) > 0.4) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
        last = 0;
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      kick();
    });
    hero.addEventListener("pointerleave", () => {
      home();
      kick();
    });
  }

  function initTilt() {
    if (reducedMotion.matches || !finePointer.matches) return;

    $$("[data-tilt]").forEach((card) => {
      const area = card.parentElement;
      const glare = $(".tilt-glare", card);
      const MAX = 6;
      let rx = 0;
      let ry = 0;
      let trx = 0;
      let try_ = 0;
      let raf = 0;
      let last = 0;

      const tick = (now) => {
        const dt = last ? Math.min(now - last, 64) : 16.67;
        last = now;
        const k = smoothing(0.1, dt);
        rx = lerp(rx, trx, k);
        ry = lerp(ry, try_, k);
        card.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        if (Math.abs(trx - rx) > 0.01 || Math.abs(try_ - ry) > 0.01) {
          raf = requestAnimationFrame(tick);
        } else {
          raf = 0;
          last = 0;
        }
      };
      const kick = () => {
        if (!raf) raf = requestAnimationFrame(tick);
      };

      area.addEventListener("pointerenter", () => card.classList.add("is-active"));
      area.addEventListener("pointermove", (e) => {
        const r = area.getBoundingClientRect();
        const px = clamp((e.clientX - r.left) / r.width, 0, 1);
        const py = clamp((e.clientY - r.top) / r.height, 0, 1);
        try_ = (px - 0.5) * MAX * 2;
        trx = (0.5 - py) * MAX * 2;
        if (glare) {
          glare.style.background = `radial-gradient(circle at ${(px * 100).toFixed(1)}% ${(py * 100).toFixed(1)}%, rgba(255, 240, 220, 0.2), transparent 55%)`;
        }
        kick();
      });
      area.addEventListener("pointerleave", () => {
        trx = 0;
        try_ = 0;
        card.classList.remove("is-active");
        kick();
      });
    });
  }

  function initSpotlight() {
    if (!finePointer.matches) return;
    doc.addEventListener(
      "pointermove",
      (e) => {
        const card = e.target.closest?.(".spot");
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      },
      { passive: true }
    );
  }

  /* ---------- Citação: as palavras acendem conforme o scroll ---------- */

  function initQuote() {
    const quote = $("[data-words]");
    if (!quote) return;

    const words = [];
    const makeWord = (text, accent) => {
      const span = doc.createElement("span");
      span.className = accent ? "qw accent-word" : "qw";
      span.textContent = text;
      words.push(span);
      return span;
    };

    const frag = doc.createDocumentFragment();
    Array.from(quote.childNodes).forEach((node) => {
      const accent = node.nodeType === Node.ELEMENT_NODE;
      node.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        frag.append(/^\s+$/.test(part) ? doc.createTextNode(" ") : makeWord(part, accent));
      });
    });
    quote.replaceChildren(frag);

    if (reducedMotion.matches) {
      words.forEach((w) => w.classList.add("is-lit"));
      quote.classList.add("is-split");
      return;
    }

    quote.classList.add("is-split");
    let lit = -1;
    onScroll(() => {
      const r = quote.getBoundingClientRect();
      const vh = window.innerHeight;
      if (r.bottom < -200 || r.top > vh + 200) return;
      const start = vh * 0.88;
      const end = vh * 0.42;
      const progress = clamp((start - r.top) / (start - end + r.height * 0.5), 0, 1);
      const count = Math.round(progress * words.length);
      if (count === lit) return;
      lit = count;
      words.forEach((w, i) => w.classList.toggle("is-lit", i < count));
    });
  }

  /* ---------- Quiz: descubra seu próximo passo ---------- */

  function initQuiz() {
    const root = $("[data-quiz]");
    if (!root) return;

    const stage = $("[data-quiz-stage]", root);
    const countEl = $("[data-quiz-count]", root);
    const barEl = $("[data-quiz-bar]", root);
    const backBtn = $("[data-quiz-back]", root);
    const live = $("[data-quiz-live]", root);
    const total = QUIZ.length;
    const answers = new Array(total).fill(null);
    let current = 0;
    let advanceTimer = 0;
    let heightAnim = null;

    // Monta as perguntas
    const stepsView = doc.createElement("div");
    stepsView.className = "quiz-steps";
    const steps = QUIZ.map((q, qi) => {
      const step = doc.createElement("div");
      step.className = "quiz-step";
      step.setAttribute("role", "group");
      step.setAttribute("aria-labelledby", `quiz-q${qi}`);
      step.innerHTML = `<h3 class="quiz-q" id="quiz-q${qi}" tabindex="-1"></h3><div class="choices"></div>`;
      $(".quiz-q", step).textContent = q.question;

      const list = $(".choices", step);
      q.options.forEach((opt, oi) => {
        const btn = doc.createElement("button");
        btn.type = "button";
        btn.className = "choice";
        btn.setAttribute("aria-pressed", "false");
        btn.innerHTML = `<span class="choice-key" aria-hidden="true">${oi + 1}</span><span class="choice-label"></span><span class="choice-check" aria-hidden="true">${ICONS.check}</span>`;
        $(".choice-label", btn).textContent = opt.label;
        btn.addEventListener("click", () => choose(qi, oi));
        list.append(btn);
      });

      stepsView.append(step);
      return step;
    });

    const hint = doc.createElement("p");
    hint.className = "quiz-hint";
    hint.innerHTML = "Dica: use as teclas <kbd>1</kbd> a <kbd>4</kbd> para responder.";
    stepsView.append(hint);

    const resultView = doc.createElement("div");
    resultView.className = "quiz-result";

    // Troca de vista com altura animada: o card cresce em vez de "pular"
    function swapView(view, animate) {
      const from = stage.offsetHeight;
      heightAnim?.cancel();
      view.classList.remove("is-in");
      stage.replaceChildren(view);
      if (!animate || reducedMotion.matches) {
        view.classList.add("is-in");
        return;
      }
      const to = stage.offsetHeight;
      stage.style.overflow = "hidden";
      heightAnim = stage.animate([{ height: `${from}px` }, { height: `${to}px` }], {
        duration: 420,
        easing: EASE_OUT,
      });
      heightAnim.onfinish = heightAnim.oncancel = () => {
        stage.style.overflow = "";
      };
      requestAnimationFrame(() => view.classList.add("is-in"));
    }

    function renderStep(focus) {
      steps.forEach((step, i) => {
        step.classList.toggle("is-active", i === current);
        step.classList.toggle("is-past", i < current);
        step.inert = i !== current;
      });
      countEl.textContent = `Pergunta ${current + 1} de ${total}`;
      barEl.style.transform = `scaleX(${(current + 1) / total})`;
      backBtn.classList.toggle("is-hidden", current === 0);
      backBtn.disabled = current === 0;
      if (focus) $(".quiz-q", steps[current]).focus({ preventScroll: true });
    }

    function choose(qi, oi) {
      if (qi !== current) return;
      answers[qi] = QUIZ[qi].options[oi].value;
      $$(".choice", steps[qi]).forEach((b, i) => b.setAttribute("aria-pressed", String(i === oi)));

      // Pequena pausa para a pessoa ver a escolha; trocar de ideia reinicia o tempo
      clearTimeout(advanceTimer);
      advanceTimer = setTimeout(
        () => {
          if (current < total - 1) {
            current += 1;
            renderStep(true);
            live.textContent = `Pergunta ${current + 1} de ${total}`;
          } else {
            showResult(computeProfile(), true);
          }
        },
        reducedMotion.matches ? 150 : 340
      );
    }

    function computeProfile() {
      const tally = {};
      answers.forEach((v) => {
        tally[v] = (tally[v] || 0) + 1;
      });
      // Empate: vale a resposta da pergunta 2 (o que a pessoa busca agora)
      let best = answers[1];
      Object.keys(tally).forEach((key) => {
        if (tally[key] > tally[best]) best = key;
      });
      return best;
    }

    function resultMarkup(profile) {
      const next = MODULES[profile.next];
      const step = (m, label, extra = "") =>
        `<li><img src="${m.img}" alt="" width="44" height="66" loading="lazy" decoding="async" /><span><small>${label}</small><strong>${m.title}</strong></span>${extra}</li>`;
      return `
        <span class="result-eyebrow">${ICONS.sparkle} Seu momento</span>
        <h3 class="result-title" tabindex="-1">${profile.title}</h3>
        <p class="result-text">${profile.text}</p>
        <ol class="path" aria-label="Sua trilha sugerida">
          ${step(MODULES.startup, "Passo 1 · Porta de entrada")}
          ${step(MODULES.imersao, "Passo 2 · Visão da igreja")}
          ${step(next, "Depois · Sua próxima etapa", '<span class="path-pill">Para você</span>')}
        </ol>
        <div class="result-actions">
          <a class="btn btn-primary" href="${CHECKOUT_URL}" target="_blank" rel="noopener">Começar minha trilha ${ICONS.arrow}</a>
          <a class="btn btn-ghost" href="curso.html#trilha">Ver a trilha completa</a>
        </div>
        <button type="button" class="link-btn" data-quiz-restart>${ICONS.refresh} Refazer o teste</button>`;
    }

    function showResult(key, fromQuiz) {
      const profile = PROFILES[key];
      if (!profile) return;
      if (fromQuiz) local.set(STORAGE_KEY, { profile: key, at: Date.now() });

      resultView.innerHTML = resultMarkup(profile);
      $("[data-quiz-restart]", resultView).addEventListener("click", restart);

      root.classList.add("is-result");
      countEl.textContent = "Seu resultado";
      barEl.style.transform = "scaleX(1)";
      backBtn.classList.add("is-hidden");
      backBtn.disabled = true;

      swapView(resultView, fromQuiz);
      if (fromQuiz) {
        $(".result-title", resultView).focus({ preventScroll: true });
        live.textContent = `Resultado: ${profile.title}`;
      }
    }

    function restart() {
      clearTimeout(advanceTimer);
      answers.fill(null);
      current = 0;
      steps.forEach((s) => $$(".choice", s).forEach((b) => b.setAttribute("aria-pressed", "false")));
      local.remove(STORAGE_KEY);
      root.classList.remove("is-result");
      swapView(stepsView, true);
      renderStep(true);
    }

    backBtn.addEventListener("click", () => {
      clearTimeout(advanceTimer);
      if (current === 0) return;
      current -= 1;
      renderStep(true);
    });

    // Atalhos 1–4 enquanto o foco está dentro do quiz
    root.addEventListener("keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || !stepsView.isConnected) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > QUIZ[current].options.length) return;
      e.preventDefault();
      $$(".choice", steps[current])[n - 1].focus();
      choose(current, n - 1);
    });

    const saved = local.get(STORAGE_KEY);
    if (saved && PROFILES[saved.profile]) {
      showResult(saved.profile, false);
    } else {
      stage.replaceChildren(stepsView);
      renderStep(false);
    }
  }

  /* ---------- Palavra para hoje (cartão que vira) ---------- */

  function initVerse() {
    const card = $("[data-verse]");
    if (!card) return;

    const inner = $("[data-verse-inner]", card);
    const faces = $$(".verse-face", card);
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 864e5);
    let index = dayOfYear % VERSES.length;
    let turns = 0;

    const dateEl = $("[data-verse-date]", card);
    if (dateEl) dateEl.textContent = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long" }).format(now);

    const fill = (face, verse) => {
      $("[data-verse-text]", face).textContent = verse.text;
      $("[data-verse-ref]", face).textContent = verse.ref;
    };
    const visibleFace = () => faces[turns % 2];
    const syncHidden = () => faces.forEach((f) => f.setAttribute("aria-hidden", String(f !== visibleFace())));

    fill(faces[0], VERSES[index]);
    syncHidden();

    $("[data-verse-next]", card).addEventListener("click", () => {
      index = (index + 1) % VERSES.length;

      if (reducedMotion.matches) {
        const face = visibleFace();
        face.classList.add("is-swapping");
        setTimeout(() => {
          fill(face, VERSES[index]);
          face.classList.remove("is-swapping");
        }, 160);
        return;
      }

      turns += 1;
      fill(visibleFace(), VERSES[index]);
      syncHidden();
      inner.style.transform = `rotateX(${turns * -180}deg)`;
    });

    const shareText = () => {
      const v = VERSES[index];
      return `“${v.text}” — ${v.ref}`;
    };

    $("[data-verse-copy]", card).addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(shareText());
        toast("Versículo copiado");
      } catch {
        toast("Não foi possível copiar agora");
      }
    });

    const shareBtn = $("[data-verse-share]", card);
    if (shareBtn && navigator.share) {
      shareBtn.hidden = false;
      shareBtn.addEventListener("click", () => {
        navigator.share({ text: shareText(), url: location.href.split("#")[0] }).catch(() => {});
      });
    }
  }

  /* ---------- Segure para dar o primeiro passo ---------- */

  function initHold() {
    const slot = $("[data-hold-slot]");
    if (!slot) return;

    const btn = $("[data-hold]", slot);
    const next = $("[data-hold-next]", slot);
    const hint = $("[data-hold-hint]");
    const labels = $$("[data-hold-label]", btn);
    const DURATION = 1200; // precisa bater com o transition do .hold-fill no CSS
    let timer = 0;
    let startedAt = 0;
    let done = false;
    let nudgeTimer = 0;

    const start = () => {
      if (done || timer) return;
      startedAt = Date.now();
      btn.classList.add("is-holding");
      timer = setTimeout(complete, DURATION);
    };

    const cancel = () => {
      if (done || !timer) return;
      clearTimeout(timer);
      timer = 0;
      btn.classList.remove("is-holding");
      // Clique rápido: a pessoa provavelmente não percebeu que é para segurar
      if (Date.now() - startedAt < 350 && hint) {
        hint.classList.add("is-nudge");
        clearTimeout(nudgeTimer);
        nudgeTimer = setTimeout(() => hint.classList.remove("is-nudge"), 1400);
      }
    };

    const swapLabel = (html) => {
      btn.classList.add("is-swapping");
      setTimeout(() => {
        labels.forEach((l) => (l.innerHTML = html));
        btn.classList.remove("is-swapping");
      }, 150);
    };

    function complete() {
      timer = 0;
      done = true;
      const hadFocus = doc.activeElement === btn;
      btn.classList.add("is-done");
      btn.classList.remove("is-holding");
      btn.setAttribute("aria-disabled", "true");
      navigator.vibrate?.(14);
      swapLabel(`${ICONS.check} Passo firmado!`);
      burst(slot);
      setTimeout(() => {
        slot.classList.add("is-complete");
        if (hint) hint.textContent = "Decisão firmada. Agora é só escolher o seu curso.";
        if (hadFocus) next.focus({ preventScroll: true });
      }, 950);
    }

    btn.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      start();
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((type) => btn.addEventListener(type, cancel));
    btn.addEventListener("contextmenu", (e) => e.preventDefault());
    btn.addEventListener("keydown", (e) => {
      if (e.key !== " " && e.key !== "Enter") return;
      e.preventDefault();
      if (!e.repeat) start();
    });
    btn.addEventListener("keyup", (e) => {
      if (e.key === " " || e.key === "Enter") cancel();
    });
    btn.addEventListener("blur", cancel);
  }

  function burst(host) {
    if (reducedMotion.matches) return;
    const COUNT = 16;
    for (let i = 0; i < COUNT; i++) {
      const spark = doc.createElement("span");
      spark.className = "spark";
      host.append(spark);
      const angle = (i / COUNT) * Math.PI * 2 + Math.random() * 0.3;
      const dist = 70 + Math.random() * 60;
      const x = Math.cos(angle) * dist * 1.7;
      const y = Math.sin(angle) * dist * 0.65;
      const anim = spark.animate(
        [
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          { transform: `translate(calc(-50% + ${x.toFixed(1)}px), calc(-50% + ${y.toFixed(1)}px)) scale(0.3)`, opacity: 0 },
        ],
        { duration: 700 + Math.random() * 400, easing: EASE_OUT, fill: "forwards" }
      );
      anim.onfinish = () => spark.remove();
    }
  }

  /* ---------- Segmented control (clip-path) ---------- */

  function createSeg(seg, { mode = "tabs", onSelect } = {}) {
    const track = $(".seg-track", seg);
    const buttons = $$(".seg-btn", track);

    // Cópia "ativa" por cima, recortada só no item selecionado
    const overlay = track.cloneNode(true);
    overlay.className = "seg-track seg-overlay";
    overlay.setAttribute("aria-hidden", "true");
    ["role", "aria-label"].forEach((attr) => overlay.removeAttribute(attr));
    $$(".seg-btn", overlay).forEach((b) => {
      const span = doc.createElement("span");
      span.className = "seg-btn";
      span.innerHTML = b.innerHTML;
      b.replaceWith(span);
    });
    seg.append(overlay);

    const stateAttr = mode === "tabs" ? "aria-selected" : "aria-pressed";
    let active = Math.max(0, buttons.findIndex((b) => b.getAttribute(stateAttr) === "true"));

    const clip = (animate) => {
      const b = buttons[active];
      const left = Math.max(0, b.offsetLeft);
      const right = Math.max(0, track.offsetWidth - left - b.offsetWidth);
      if (!animate) overlay.style.transition = "none";
      overlay.style.clipPath = `inset(0 ${right}px 0 ${left}px round 999px)`;
      if (!animate) {
        void overlay.offsetWidth;
        overlay.style.transition = "";
      }
    };

    const select = (i, { focus = false } = {}) => {
      if (i === active) return;
      active = i;
      buttons.forEach((b, bi) => {
        b.setAttribute(stateAttr, String(bi === i));
        if (mode === "tabs") b.tabIndex = bi === i ? 0 : -1;
      });
      if (focus) buttons[i].focus();
      clip(!reducedMotion.matches);
      onSelect?.(buttons[i], i);
    };

    buttons.forEach((b, i) => b.addEventListener("click", () => select(i)));

    if (mode === "tabs") {
      track.addEventListener("keydown", (e) => {
        const last = buttons.length - 1;
        const map = { ArrowRight: active + 1, ArrowLeft: active - 1, Home: 0, End: last };
        if (!(e.key in map)) return;
        e.preventDefault();
        const target = map[e.key] > last ? 0 : map[e.key] < 0 ? last : map[e.key];
        select(target, { focus: true });
      });
    }

    clip(false);
    if ("ResizeObserver" in window) new ResizeObserver(() => clip(false)).observe(track);
    doc.fonts?.ready.then(() => clip(false));

    return { select, buttons };
  }

  /* ---------- Cursos: abas + pilha de capas ---------- */

  function initCourseTabs() {
    const seg = $("[data-course-tabs]");
    if (!seg) return;

    const covers = $$("[data-cover]");
    const panels = $$("[data-panel]");

    const api = createSeg(seg, {
      mode: "tabs",
      onSelect: (btn) => {
        const key = btn.dataset.course;
        covers.forEach((c) => (c.dataset.pos = c.dataset.cover === key ? "front" : "back"));
        panels.forEach((p) => p.classList.toggle("is-active", p.dataset.panel === key));
      },
    });

    // Clicar na capa de trás também troca de curso
    covers.forEach((cover) => {
      cover.addEventListener("click", () => {
        if (cover.dataset.pos !== "back") return;
        const i = api.buttons.findIndex((b) => b.dataset.course === cover.dataset.cover);
        if (i >= 0) api.select(i);
      });
    });
  }

  /* ---------- Trilha horizontal: arrastar, filtrar, navegar ---------- */

  function initTrail() {
    const trail = $("[data-trail]");
    if (!trail) return null;

    const viewport = $("[data-trail-viewport]", trail);
    const list = $("[data-modules]", trail);
    const items = $$(".module", list);
    const prev = $("[data-trail-prev]", trail);
    const next = $("[data-trail-next]", trail);
    const thumb = $("[data-trail-thumb]", trail);
    const countEl = $("[data-trail-count]", trail);
    const filterSeg = $("[data-trail-filter]", trail);

    const sizeThumb = () => {
      const ratio = viewport.scrollWidth > 0 ? viewport.clientWidth / viewport.scrollWidth : 1;
      thumb.style.width = `${clamp(ratio, 0.08, 1) * 100}%`;
      return ratio;
    };

    let ratio = sizeThumb();
    const updateNav = () => {
      const max = viewport.scrollWidth - viewport.clientWidth;
      const p = max > 0 ? viewport.scrollLeft / max : 0;
      const r = clamp(ratio, 0.08, 1);
      thumb.style.transform = `translateX(${(p * (1 / r - 1) * 100).toFixed(2)}%)`;
      prev.disabled = viewport.scrollLeft <= 2;
      next.disabled = viewport.scrollLeft >= max - 2;
      viewport.classList.toggle("at-start", prev.disabled);
      viewport.classList.toggle("at-end", next.disabled);
      trail.classList.toggle("is-static", max <= 2);
    };

    viewport.addEventListener("scroll", () => requestAnimationFrame(updateNav), { passive: true });
    window.addEventListener("resize", () => {
      ratio = sizeThumb();
      updateNav();
    });
    updateNav();

    const step = () => (items.find((el) => !el.hidden)?.offsetWidth || 236) + 20;
    const scrollByCards = (dir) => {
      const amount = Math.max(step(), Math.floor(viewport.clientWidth / step()) * step());
      viewport.scrollBy({ left: dir * amount, behavior: reducedMotion.matches ? "auto" : "smooth" });
    };
    prev.addEventListener("click", () => scrollByCards(-1));
    next.addEventListener("click", () => scrollByCards(1));

    // Arrastar com o mouse (toque já rola nativamente), com inércia ao soltar
    let drag = null;
    let glide = 0;
    let suppressClick = false;

    const stopGlide = () => {
      cancelAnimationFrame(glide);
      glide = 0;
      viewport.classList.remove("is-gliding");
    };

    viewport.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      stopGlide();
      drag = { id: e.pointerId, x: e.clientX, left: viewport.scrollLeft, lastX: e.clientX, lastT: e.timeStamp, v: 0, moved: false };
    });

    viewport.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) {
        if (Math.abs(dx) < 5) return;
        drag.moved = true;
        viewport.setPointerCapture(e.pointerId);
        viewport.classList.add("is-dragging");
      }
      viewport.scrollLeft = drag.left - dx;
      const dt = Math.max(e.timeStamp - drag.lastT, 1);
      drag.v = lerp(drag.v, (e.clientX - drag.lastX) / dt, 0.6);
      drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
    });

    const endDrag = () => {
      if (!drag) return;
      const { moved, v } = drag;
      drag = null;
      viewport.classList.remove("is-dragging");
      if (!moved) return;
      suppressClick = true;
      setTimeout(() => (suppressClick = false), 0);
      if (reducedMotion.matches) return;

      let velocity = -v * 16; // px por quadro
      let last = 0;
      viewport.classList.add("is-gliding");
      const tick = (now) => {
        const dt = last ? Math.min(now - last, 64) : 16.67;
        last = now;
        viewport.scrollLeft += velocity * (dt / 16.67);
        velocity *= Math.pow(0.94, dt / 16.67);
        if (Math.abs(velocity) > 0.3) glide = requestAnimationFrame(tick);
        else stopGlide();
      };
      glide = requestAnimationFrame(tick);
    };
    viewport.addEventListener("pointerup", endDrag);
    viewport.addEventListener("pointercancel", endDrag);
    viewport.addEventListener("wheel", stopGlide, { passive: true });
    viewport.addEventListener(
      "click",
      (e) => {
        if (!suppressClick) return;
        e.preventDefault();
        e.stopPropagation();
      },
      true
    );

    // Filtro com FLIP: cada card desliza da posição antiga para a nova
    const applyFilter = (kind) => {
      const first = new Map();
      items.forEach((el) => {
        if (!el.hidden) first.set(el, el.getBoundingClientRect());
        el.getAnimations().forEach((a) => a.cancel());
      });

      stopGlide();
      let shown = 0;
      items.forEach((el) => {
        const show = kind === "all" || el.dataset.kind === kind;
        el.hidden = !show;
        if (show) shown += 1;
      });
      // Volta ao início *depois* de trocar os cards e com o snap ligado: assim o
      // navegador passa a "lembrar" do primeiro card e não re-encaixa no antigo
      viewport.scrollTo({ left: 0, behavior: "instant" });
      countEl.textContent = `${shown} ${shown === 1 ? "etapa" : "etapas"}`;
      ratio = sizeThumb();
      updateNav();

      if (reducedMotion.matches) return;
      let entering = 0;
      items.forEach((el) => {
        if (el.hidden) return;
        const last = el.getBoundingClientRect();
        const before = first.get(el);
        if (before) {
          const dx = before.left - last.left;
          const dy = before.top - last.top;
          if (Math.abs(dx) + Math.abs(dy) < 1) return;
          el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], {
            duration: 480,
            easing: EASE_OUT,
          });
        } else {
          el.animate([{ opacity: 0, transform: "scale(0.94)" }, { opacity: 1, transform: "none" }], {
            duration: 380,
            delay: entering++ * 50,
            easing: EASE_OUT,
            fill: "backwards",
          });
        }
      });
    };

    const filterApi = filterSeg
      ? createSeg(filterSeg, { mode: "toggle", onSelect: (btn) => applyFilter(btn.dataset.filter) })
      : null;

    return {
      // Leva a trilha até um card e dá um destaque rápido nele
      reveal(key) {
        const item = items.find((el) => el.dataset.key === key);
        if (!item) return;
        if (item.hidden && filterApi) filterApi.select(0);
        trail.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "center" });
        setTimeout(() => {
          const left = item.offsetLeft - parseFloat(getComputedStyle(viewport).paddingLeft || "0");
          viewport.scrollTo({ left, behavior: reducedMotion.matches ? "auto" : "smooth" });
          item.classList.remove("is-flash");
          void item.offsetWidth;
          item.classList.add("is-flash");
        }, reducedMotion.matches ? 0 : 450);
      },
    };
  }

  /* ---------- Cursos: recomendação vinda do quiz ---------- */

  function initRecommendation(trailApi) {
    const strip = $("[data-reco]");
    if (!strip || session.get(RECO_DISMISSED_KEY)) return;

    const text = $("[data-reco-text]", strip);
    const link = $("[data-reco-link]", strip);
    const saved = local.get(STORAGE_KEY);
    const profile = saved && PROFILES[saved.profile];

    if (profile) {
      const next = MODULES[profile.next];
      text.innerHTML = `Pelo seu teste, sua trilha é <strong>Start UP</strong> → <strong>Imersão e Visão</strong> → <strong></strong>.`;
      text.querySelector("strong:last-child").textContent = next.title;
      link.textContent = "Ver na trilha";
      link.href = "#trilha";
      link.addEventListener("click", (e) => {
        if (!trailApi) return;
        e.preventDefault();
        trailApi.reveal(profile.next);
      });

      const item = $(`.module[data-key="${profile.next}"]`);
      if (item) {
        item.classList.add("is-reco");
        const badge = doc.createElement("span");
        badge.className = "badge badge-reco";
        badge.textContent = "Recomendado para você";
        $(".module-cover", item).prepend(badge);
      }
    } else {
      text.innerHTML = "Não sabe por onde começar? <strong>Faça o teste de 30 segundos</strong> e descubra a sua trilha.";
    }

    strip.hidden = false;

    $("[data-reco-close]", strip).addEventListener("click", () => {
      session.set(RECO_DISMISSED_KEY, true);
      if (reducedMotion.matches) {
        strip.hidden = true;
        return;
      }
      strip.classList.add("is-leaving");
      setTimeout(() => (strip.hidden = true), 220);
    });
  }

  /* ---------- Cursos: barra de compra flutuante ---------- */

  function initBuyBar() {
    const bar = $("[data-buybar]");
    const offer = $("#oferta");
    if (!bar || !offer) return;

    // Medido a cada frame de scroll (e não por IntersectionObserver): um salto
    // de âncora que passa direto pela oferta também precisa mostrar a barra
    const stops = $$("[data-buybar-stop]");
    let shown = null;
    onScroll(() => {
      const vh = window.innerHeight;
      const pastOffer = offer.getBoundingClientRect().bottom < 0;
      const atStop = stops.some((el) => {
        const r = el.getBoundingClientRect();
        return r.top < vh && r.bottom > 0;
      });
      const show = pastOffer && !atStop;
      if (show === shown) return;
      shown = show;
      bar.classList.toggle("is-visible", show);
      bar.inert = !show;
    });
  }

  /* ---------- Vídeo com capa e botão próprio ---------- */

  function initVideo() {
    $$("[data-video]").forEach((frame) => {
      const video = $("video", frame);
      const play = $("[data-video-play]", frame);
      if (!video || !play) return;
      play.addEventListener("click", () => {
        frame.classList.add("is-playing");
        video.controls = true;
        video.play()?.catch(() => {});
        video.focus({ preventScroll: true });
      });
    });
  }

  /* ---------- Início ---------- */

  initHeader();
  initHeroTitle();
  initReveal();
  initHeroLight();
  initTilt();
  initSpotlight();
  initQuote();
  initQuiz();
  initVerse();
  initHold();
  initCourseTabs();
  const trailApi = initTrail();
  initRecommendation(trailApi);
  initBuyBar();
  initVideo();
})();
