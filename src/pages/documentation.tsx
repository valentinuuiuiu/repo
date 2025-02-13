import styles from "./documentation.module.css";
import { useTranslation } from 'react-i18next';

const DocumentationPage = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{t('Documentation')}</h1>
      {/* Add documentation content here */}
    </div>
  );
};

export default DocumentationPage;
