export default function ContactUs() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-blue-600 mb-8 text-center">Contact Us</h1>
      <div className="max-w-2xl mx-auto">
        <div className="text-center space-y-4">
          <p className="text-gray-700 text-lg">
            We&apos;d love to hear from you! Whether you have questions about our products, need support, or want to learn more about how Sabecho can help your business, please reach out to us.
          </p>
          <div className="space-y-2">
            <p className="text-gray-600">Reach us directly at:</p>
            <p className="text-blue-600 font-medium">support@sabecho.com</p>
            <p className="text-gray-600">+1 (555) 123-4567</p>
          </div>
          <div className="mt-6">
            <p className="text-gray-600">Our team is available Monday through Friday, 9 AM to 5 PM EST.</p>
          </div>
        </div>
      </div>
    </div>
  )
}