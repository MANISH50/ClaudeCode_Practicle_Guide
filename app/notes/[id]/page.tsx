type NotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;

  return (
    <div>
      <p>Note editor page (placeholder) for note: {id}</p>
      <p>Share publicly: auto-generated URL /share/{"{token}"} (not implemented yet)</p>
    </div>
  );
}
