import Content from './content';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AnalysisDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  return <Content id={id} />;
}
