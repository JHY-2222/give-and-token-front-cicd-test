function StatCard({ label, value, accent, helper, icon, className = "" }) {
  const helperText = typeof helper === "string" ? helper : "";
  const helperMatch = helperText.match(/^(.*?)([+-]\d+(?:\.\d+)?%)$/);

  return (
    <article className={`stat-card ${accent || ""} ${className}`.trim()}>
      <div className="stat-card__main">
        <div className="stat-card__content">
          <p>{label}</p>
          <strong>{value}</strong>
          {helper ? (
            <span className="stat-card__helper">
              {helperMatch ? helperMatch[1].trim() : helper}
              {helperMatch ? <em className="stat-card__delta">{helperMatch[2]}</em> : null}
            </span>
          ) : null}
        </div>
        {icon ? <span className="stat-card__icon">{icon}</span> : null}
      </div>
    </article>
  );
}

export default StatCard;
