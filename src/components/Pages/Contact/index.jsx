import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Page from '../../layout/Page';

const EMPTY = { name: '', email: '', message: '' };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate({ name, email, message }) {
  const errors = {};
  if (name.trim().length < 2) errors.name = 'Please enter your name (at least 2 characters).';
  if (!EMAIL_RE.test(email.trim())) errors.email = 'Please enter a valid email address.';
  if (message.trim().length < 10) errors.message = 'Please write a message of at least 10 characters.';
  return errors;
}

const fieldClass = (hasError) =>
  `w-full py-2 px-3 border rounded bg-white ${hasError ? 'border-red-600' : 'border-gray-400'}`;

const Contact = () => {
  const [formData, setFormData] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(formData);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    // Demo store: there is no backend, so the message is not sent anywhere.
    toast.success(`Thanks, ${formData.name.trim()}! This is a demo form, so your message was not sent.`, { duration: 5000 });
    setFormData(EMPTY);
  };

  return (
    <Page title="Contact">
      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6 md:p-10">
        <h1 className="text-3xl font-bold text-green-800">Contact us</h1>
        <p className="mt-3 text-gray-700">
          Have a question about a product or the cart? Send a message. This is a demo store, so the form checks your
          input but does not send anything.
        </p>
        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <div>
            <label htmlFor="name" className="block font-semibold mb-1">Name</label>
            <input
              id="name"
              type="text"
              name="name"
              autoComplete="name"
              className={fieldClass(errors.name)}
              value={formData.name}
              onChange={handleChange}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
            />
            {errors.name && <p id="name-error" className="mt-1 text-sm text-red-700">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block font-semibold mb-1">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              autoComplete="email"
              className={fieldClass(errors.email)}
              value={formData.email}
              onChange={handleChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
            {errors.email && <p id="email-error" className="mt-1 text-sm text-red-700">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="message" className="block font-semibold mb-1">Message</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              className={fieldClass(errors.message)}
              value={formData.message}
              onChange={handleChange}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={errors.message ? 'message-error' : undefined}
            />
            {errors.message && <p id="message-error" className="mt-1 text-sm text-red-700">{errors.message}</p>}
          </div>
          <button
            type="submit"
            className="self-start bg-green-700 text-white font-semibold py-2 px-6 rounded-full text-lg hover:bg-green-800"
          >
            Send message
          </button>
        </form>
      </div>
    </Page>
  );
};

export default Contact;
