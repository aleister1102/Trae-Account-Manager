import { useTranslation } from "react-i18next";

export function About() {
  const { t } = useTranslation();
  return (
    <div className="about-page">
      <h2 className="page-title">{t("about.title")}</h2>

      <div className="about-card">
        <div className="about-logo">🚀</div>
        <h3>Trae Auto</h3>
        <p className="about-version">{t("about.version", { version: "1.0.0" })}</p>
        <p className="about-desc">
          {t("about.description")}
        </p>
      </div>

      <div className="about-section">
        <h3>{t("about.features")}</h3>
        <ul className="feature-list">
          {(t("about.feature_list", { returnObjects: true }) as string[]).map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </div>

      <div className="about-section">
        <h3>{t("about.tech_stack")}</h3>
        <div className="tech-tags">
          <span className="tech-tag">Tauri</span>
          <span className="tech-tag">React</span>
          <span className="tech-tag">TypeScript</span>
        </div>
      </div>

      <div className="about-section">
        <h3>{t("about.license")}</h3>
        <p>MIT License</p>
      </div>
    </div>
  );
}
