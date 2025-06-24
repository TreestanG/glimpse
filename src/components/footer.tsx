export default function Footer() {
  return (
    <footer className="mt-auto">
      <div className="flex items-center justify-between">
        <p className="text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Glimpse.
        </p>
      </div>
    </footer>
  );
}
