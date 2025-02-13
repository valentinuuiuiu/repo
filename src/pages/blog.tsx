import styles from "./blog.module.css";
import { useTranslation } from 'react-i18next';

const BlogPage = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>{t('Blog')}</h1>
      {/* Add blog content here */}
    </div>
  );
};

export default BlogPage;
