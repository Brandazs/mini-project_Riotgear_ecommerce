'use client'
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { ProductData } from '@/app/utils/utils';
import Modal from '@/app/components/Modal/Modal';
import { getCookie } from 'cookies-next';interface Props {
  setDataProducts: React.Dispatch<React.SetStateAction<any>>
  handleModal: () => void;
}

export const initialState = {
  productName: '',
  productMainCategory: '',
  productSubCategory: '',
  productSize: '',
  productGender: '',
  productColor: '',
  productStock: '',
  productDesc: '',
  productImgLink: '',
  productPrice: '',
  featured: 0,
};

const FormProduct: React.FC<Props> = ({
  setDataProducts,
  handleModal,

}) => {
  const [form, setForm] = useState(initialState);
  
  const handleInput = (e: React.SyntheticEvent) => {
    const { name, value } = (e.target as HTMLInputElement);
    setForm({
      ...form,
      [name]: value
    })
  }
  
  const token = getCookie('token');
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
  
  const sendData = async () => {
    const id = uuidv4();
    const productStock = parseInt(form.productStock)
    const productPrice = parseFloat(form.productPrice)
    await axios.post("/api/products", {
      productId: id,
      productName: form.productName,
      productMainCategory: form.productMainCategory,
      productSubCategory: form.productSubCategory,
      productImgLink: form.productImgLink,
      productSize: form.productSize,
      productGender: form.productGender,
      productColor: form.productColor,
      productStock: productStock,
      productDesc: form.productDesc,
      productPrice: productPrice,
      featured: form.featured !== 1,
    }, {
      headers: headers
    })
    .then(response => {
      setDataProducts((prevState: ProductData[]) => [
        ...prevState,
        response.data
      ])
    })
    .catch(error => {
      console.error('Request Rejected:', error);
    });
  }
  
  const handleSubmit = () => {
    sendData();
    handleModal();
    setForm(initialState);
  }

    return (
        <>
          <Modal 
            handleInput={handleInput}
            handleModal={handleModal}
            handleSubmit={handleSubmit}
            form={form}
            label={"Add Product"}
          />
        </>
    );
};

export default FormProduct;