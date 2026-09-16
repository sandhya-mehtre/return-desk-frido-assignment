export default function AboutPage() {
  console.log("into about page ; to work on it later")
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl rounded-2xl bg-white p-10 text-center shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900">
          About Us
        </h1>
        <p className="mt-4 text-lg font-medium text-gray-700">
          About Us page is coming soon!
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-gray-500">
          We’re currently working on this page and will be adding more
          information about our project, team, and vision soon.
        </p>
        <div className="mt-8 inline-block rounded-lg bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600">
          More information coming soon
        </div>
      </div>
    </main>
  );
}
