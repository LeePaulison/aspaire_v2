export default function MessageList({ children }) {
  return (
    <div className="flex-1 min-w-0 max-w-full p-4">
      <div className="mx-auto flex w-full max-w-full flex-col gap-4">
        {children}
      </div>
    </div>
  );
}
