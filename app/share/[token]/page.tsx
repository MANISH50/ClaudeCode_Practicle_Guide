type SharePageProps = {
  params: Promise<{ token: string }>;
};

export default async function SharedNotePage({ params }: SharePageProps) {
  const { token } = await params;

  return <p>Shared note page (placeholder) for token: {token}</p>;
}
