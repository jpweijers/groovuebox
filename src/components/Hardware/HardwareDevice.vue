<template>
  <main class="scene">
    <section class="device">
      <div class="top-shell">
        <div class="wood wood--left" />
        <div class="face">
          <span class="screw screw--tl"></span>
          <span class="screw screw--tr"></span>
          <span class="screw screw--bl"></span>
          <span class="screw screw--br"></span>

          <div class="header"><strong>GROOVUEBOX</strong><span>super beatmaker v0.0.1</span></div>

          <slot />
        </div>
        <div class="wood wood--right" />
      </div>
    </section>
  </main>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

.scene {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 64px;
  background: radial-gradient(
    circle at 50% 20%,
    var(--scene-highlight) 0,
    var(--scene-mid) 42%,
    var(--scene-edge) 100%
  );
  color: var(--device-ink);
  font-family: Arial, Helvetica, sans-serif;
}

.device {
  position: relative;
  width: min(1180px, 96vw);
  filter: drop-shadow(0 34px 28px rgb(0 0 0 / 0.52));
}

.top-shell {
  display: grid;
  grid-template-columns: 42px 1fr 42px;
  align-items: stretch;
}

.face {
  position: relative;
  z-index: 2;
  min-height: 620px;
  padding: 28px 32px 36px;
  background:
    linear-gradient(
      135deg,
      rgb(var(--device-face-highlight-rgb) / 0.085) 0%,
      rgb(var(--device-face-highlight-rgb) / 0.035) 24%,
      transparent 52%,
      rgb(0 0 0 / 0.09) 100%
    ),
    repeating-linear-gradient(90deg, rgb(255 255 255 / 0.016) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(90deg, rgb(0 0 0 / 0.018) 0 1px, transparent 1px 9px),
    var(--device-face);
  background-blend-mode: normal, soft-light, multiply, normal;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.09),
    inset -1px -2px rgb(0 0 0 / 0.3);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 18px;
  border-bottom: 1px solid rgb(255 255 255 / 0.08);
}

.header strong {
  font-size: 24px;
  letter-spacing: 0.08em;
}

.header span {
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.18em;
  color: var(--device-ink-muted);
}

.wood {
  position: relative;
  z-index: 3;
  background-size:
    100% 100%,
    cover;
  background:
    linear-gradient(
      135deg,
      rgb(var(--device-face-highlight-rgb) / 0.14) 0%,
      rgb(var(--device-face-highlight-rgb) / 0.05) 26%,
      transparent 55%,
      rgb(0 0 0 / 0.2) 100%
    ),
    url('/wood.png');
  background-blend-mode: soft-light, normal;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.09),
    inset -1px 0 rgb(0 0 0 / 0.22),
    inset 0 0 12px rgb(0 0 0 / 0.1);
}

.wood--left {
  border-radius: var(--radius-shell) 0 0 var(--radius-shell);
}

.wood--right {
  border-radius: 0 var(--radius-shell) var(--radius-shell) 0;
}

.wood::after {
  content: '';
  position: absolute;
  inset: 1px;
  pointer-events: none;
  border-radius: inherit;
  background-blend-mode: normal, soft-light, multiply, normal;
  box-shadow:
    inset 0 1px rgb(255 255 255 / 0.06),
    inset 0 -1px rgb(0 0 0 / 0.22);
}

.screw {
  position: absolute;
  z-index: 5;
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, var(--screw-highlight), var(--screw-face) 68%);
  box-shadow: inset 0 0 2px #000;
}

.screw::after {
  content: '';
  position: absolute;
  left: 2px;
  right: 2px;
  top: 5px;
  height: 1px;
  background: var(--screw-slot);
  transform: rotate(-25deg);
}

.screw--tl {
  top: 13px;
  left: 13px;
}

.screw--tr {
  top: 13px;
  right: 13px;
}

.screw--bl {
  bottom: 13px;
  left: 13px;
}

.screw--br {
  bottom: 13px;
  right: 13px;
}
</style>
