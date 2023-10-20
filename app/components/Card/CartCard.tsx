/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import Image from "next/image";
import { Heading } from "../Container/Heading";
import { Text } from "../Container/Text";
import closeIcon from '../../assets/icon/closeIcon.svg'
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Flex } from "../Container/Flex";
import axios from "axios";
import Transparent from "../Container/Transparent";
import { usePrevious } from "@/app/hooks/usePrevious";
import { deleteData } from "@/app/utils/api";
import { cart, userJwtSchema } from "@/app/utils/types";
import CartModal from "../Modal/CartModal";

interface CartCardProps {
  data: cart;
  user: undefined | userJwtSchema;
  handleProduct: Dispatch<SetStateAction<cart[]>>;
}

  const CartCard: React.FC<CartCardProps> = ({ data, user, handleProduct }) => {
  const [modal, setModal] = useState(false);
  const [state, setState] = useState({
    quantity: data.quantity,
    dataId: '',
    loading: false,
  })

  const {
    productName,
    productImgLink,
    productColor,
    productSize,
    productPrice,
    productStock
  } = data.productInfo;
  const idCart = data.id.toString();

  const handleQuantity = (e: React.SyntheticEvent) => {
    const { value, id } = e.target as HTMLSelectElement;
    setState({
      ...state,
      quantity: Number(value),
      dataId: id
    });
  }
  
  const prevQuantity = usePrevious(state.quantity);
  const queryProduct = `/api/user/${user?.userId}/cart`
  useEffect(() => {
    if (prevQuantity !== state.quantity && state.dataId !== '') {
      setState({
        ...state,
        loading: true
      })
      axios.patch(`${queryProduct}/${state.dataId}`, state.quantity)
        .then((response) => {
          handleProduct(response.data)
          setState({
            ...state,
            loading: false
          })
        })
    }

  }, [state.quantity]);

  const handleDelete = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    const { id } = e.target as HTMLImageElement;
    setState({
      ...state,
      loading: true
    })
    await deleteData(`${queryProduct}/${id}`)
      .then((res) => {
        handleProduct(res.data)
        setState({
          ...state,
          loading: false
        })
      })

  }

  const options = [];
  if (productStock) {
    const loopCount = Math.min(productStock, 10);
    for (let i = 0; i < loopCount; i++) {
      options.push(i + 1);
    }
  }


  return (
    <>
      {state.loading
        ? <Transparent>
          <span className="loading loading-spinner loading-lg"></span>
        </Transparent>

        : <article className="flex flex-row relative gap-5">
          <button
            className="absolute end-0 top-0" onClick={() => setModal(true)}>
            <Image
              width={20}
              height={20}
              src={closeIcon} alt="close icon" />
          </button>
          <figure className="w-1/3">
            <Image
              className="rounded-md md:rounded-lg"
              width={253}
              height={190}
              src={productImgLink} alt="product image" />
          </figure>
          <Flex variant={'col'} align={'between'} className="w-2/3 max-w-md pe-4">
            <Flex variant={'col'} className="md:gap-3">
              <Heading className="line-clamp-2">{productName}</Heading>
              <Text className="capitalize">{`Color: ${productColor}`}</Text>
              <Text className="uppercase">{`Size: ${productSize}`}</Text>
            </Flex>

            <Flex variant={'col'} className="md:gap-3">
              <Heading>{`Rp${productPrice.toLocaleString('ID-id')}`}</Heading>
              <label className="flex flex-col">
                Quantity
                <select
                  value={state.quantity}
                  id={idCart}
                  onChange={(e) => handleQuantity(e)}
                  className="px-4 py-2 rounded-md w-full max-w-[5.4rem] md:mt-3"
                  name="selectQuantity">
                  {options?.map((data) =>
                    <option
                      key={data}
                      value={data}>{data}
                    </option>
                  )}
                </select>
              </label>
            </Flex>
          </Flex>
        </article>
      }
      {modal &&
        <CartModal
          id={idCart}
          setModal={setModal}
          modal={modal}
          action={handleDelete}
          title="REMOVE ITEM"
          btnLeft="REMOVE"
          btnRight="CANCEL">
          <Heading variant={'five'} bold={'normal'}>Are you sure you want to remove this item from your cart?</Heading>
        </CartModal>

      }
    </>
  );
};

export default CartCard;