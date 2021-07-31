import { GetStaticPaths, GetStaticProps } from 'next';

import Prismic from '@prismicio/client';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';

import ptBR from 'date-fns/locale/pt-BR';
import format from 'date-fns/format';
import { RichText } from 'prismic-dom';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const wordsCouter = post.data.content.reduce((acc, atual) => {
    acc += atual.heading.split(' ').length;

    const words = atual.body.map(item => {
      return item.text.split(' ').length;
    });

    words.map(word => (acc += word));

    return acc;
  }, 0);

  const time = Math.ceil(wordsCouter / 200);

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <div className={styles.headerConteiner}>
        <Header />
      </div>

      <img className={styles.img} src={post.data.banner.url} alt="banner" />
      <main className={commonStyles.container}>
        <div className={styles.content}>
          <h1>{post.data.title}</h1>
          <div className={styles.boxSpan}>
            <span>
              <FiCalendar size={20} color="#BBBBBB" />{' '}
              {format(new Date(post.first_publication_date), 'dd LLL y', {
                locale: ptBR,
              })}
            </span>
            <span>
              <FiUser size={20} color="#BBBBBB" />
              {post.data.author}
            </span>
            <span>
              <FiClock size={20} color="#BBBBBB" />
              {`${time} min`}
            </span>
          </div>
          <section className={styles.info}>
            {post.data.content.map(content => (
              <article key={content.heading}>
                <h2>{content.heading}</h2>
                <div
                  dangerouslySetInnerHTML={{
                    __html: RichText.asHtml(content.body),
                  }}
                />
              </article>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
  ]);

  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('pos', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      subtitle: response.data.subtitle,
      author: response.data.author,
      content: response.data.content,
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, //30 minutos
  };
};
