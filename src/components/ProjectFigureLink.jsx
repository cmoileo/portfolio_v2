/**
 * Wraps a project figure in a link to the live site. The figure itself
 * reacts on hover (handled in each figure's own markup/CSS); this wrapper
 * only adds the anchor and the "visit live" call-to-action that slides in.
 * The custom cursor already reacts to the anchor.
 */
export default function ProjectFigureLink({ href, label, tone = "light", children }) {
  return (
    <a
      className={`figure-link figure-link--${tone}`}
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={`Visit ${label} (opens in a new tab)`}
    >
      {children}
      <span className="figure-link__cta" aria-hidden="true">
        <span className="figure-link__cta-kicker">Visit live</span>
        <span className="figure-link__cta-url">
          {label}
          <span className="figure-link__cta-arrow">↗</span>
        </span>
      </span>
    </a>
  );
}
