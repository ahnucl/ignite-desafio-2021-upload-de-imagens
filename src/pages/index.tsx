import { Button, Box } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useInfiniteQuery } from 'react-query';

import { Header } from '../components/Header';
import { CardList } from '../components/CardList';
import { api } from '../services/api';
import { Loading } from '../components/Loading';
import { Error } from '../components/Error';

interface ImagesQuery {
  data: {
    title: string;
    description: string;
    url: string;
    ts: number;
    id: string;
  }[];
  after: number | null;
}

async function requestImages({ pageParam = null } = {}): Promise<ImagesQuery> {
  const { data } = await api.get('/api/images', {
    params: {
      after: pageParam,
    },
  });

  console.log('data', data);

  return data;
}

function getNextPageParam({ after }: ImagesQuery): number | null {
  console.log('after', after);

  return after;
}

export default function Home(): JSX.Element {
  const {
    data,
    isLoading,
    isError,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: 'images',
    queryFn: requestImages,
    getNextPageParam,
  });

  const formattedData = useMemo(() => {
    // Acho que é isso, preciso testar
    if (!data) {
      return [];
    }

    return data.pages.map(page => page.data).flat();
  }, [data]);

  const handleLoadMore = (): void => {
    fetchNextPage();
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error />;
  }

  return (
    <>
      <Header />

      <Box maxW={1120} px={20} mx="auto" my={20}>
        <CardList cards={formattedData} />

        {hasNextPage && (
          <Button
            onClick={handleLoadMore}
            isLoading={isFetchingNextPage}
            loadingText="Carregando..."
            mt={10}
          >
            Carregar mais
          </Button>
        )}
      </Box>
    </>
  );
}
