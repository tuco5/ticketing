import React, { useState } from 'react';
import axios from 'axios';

export default function useRequest({ url, method, body, onSuccess }) {
  const [errors, setErrors] = useState(null);

  async function doRequest(props = {}) {
    console.log(props);
    try {
      setErrors(null);
      const response = await axios[method](url, { ...body, ...props });

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (err) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Ooops...</h4>
          <ul className="my-0">
            {err.response.data.errors.map((error) => (
              <li key={error.msg}>{error.msg}</li>
            ))}
          </ul>
        </div>
      );
    }
  }

  return { doRequest, errors };
}
