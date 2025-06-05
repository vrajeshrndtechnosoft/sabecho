import RequirementsForm from "@/components/requirements-form"

export default function RequirementsSection() {
  return (
  <>
    <section
      className="py-16 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4 sm:px-6 lg:px-8"
      aria-labelledby="requirements-heading"
    >
      <div className="bg-white rounded-xl border-none shadow-lg w-full max-w-5xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 rounded-t-xl">
          <h2
            id="requirements-heading"
            className="text-3xl md:text-4xl font-bold text-white tracking-tight"
          >
            Share Your Requirements
          </h2>
          <p className="mt-2 text-lg text-blue-100 max-w-2xl">
            Let us know what you need, and we’ll connect you with the best solutions.
          </p>
        </header>
        <div className="p-6 sm:p-8 bg-white rounded-b-xl">
          <RequirementsForm />
        </div>
      </div>
    </section>
    </>
  )
}