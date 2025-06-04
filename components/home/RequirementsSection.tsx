import RequirementsForm from "@/components/requirements-form"

export default function RequirementsSection() {
  return (
    <div className="bg-white flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl relative">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-t-lg flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tell Us Your Requirement</h2>
        </div>
        <RequirementsForm />
      </div>
    </div>
  )
}
