import { useForm } from "react-hook-form";
import { TUserAddressSchema, userAddressSchema } from "../utils/types";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";



const useAddressForm = (userId: string) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    watch,
    control,
  } = useForm<TUserAddressSchema>({
    resolver: zodResolver(userAddressSchema)
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (data: TUserAddressSchema) => {
    setLoading(true);
    axios.post(`/api/user/${userId}/order`, data)
      .then((res) => {
          if (res.status === 201) {
            setLoading(false);
            router.push(`/store/payment?orderId=${res.data.orderId}`);
          } else {
            throw new Error(res.data.error)
          }
      }
      )
      .catch(err => {
        console.log(err);
        if (err.name) {
          setError("name", {
            type: "server",
            message: err.name
          });
        } else if (err.phone) {
          setError("phone", {
            type: "server",
            message: err.phone,
          });
        } else if (err.email) {
          setError("email", {
            type: "server",
            message: err.email,
          });
        } else if (err.country) {
          setError("country", {
            type: "server",
            message: err.country,
          });
        } else if (err.city) {
          setError("city", {
            type: "server",
            message: err.city,
          });
        } else if (err.district) {
          setError("district", {
            type: "server",
            message: err.district,
          });
        } else if (err.address) {
          setError("address", {
            type: "server",
            message: err.address,
          });
        } else if (err.zip) {
          setError("zip", {
            type: "server",
            message: err.zip,
          });
        } else if (err.paymentMethod) {
          setError("paymentMethod", {
            type: "server",
            message: err.paymentMethod,
          });
        } else (
          alert("Something went wrong")
        )
      })
      .finally(() => {
        setLoading(false);
      })
    reset();
  }
  return {
    register,
    handleSubmit,
    errors,
    isSubmitting,
    onSubmit,
    watch,
    control,
    loading
  }
}

export default useAddressForm;