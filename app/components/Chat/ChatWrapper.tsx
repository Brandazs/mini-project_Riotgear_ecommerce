'use client'
import chatIcon from '@/app/assets/icon/chat.png'
import { Button } from '../Button/Button';
import Image from 'next/image';
import ChatAI from './ChatAI';
import { useState } from 'react';
import axios from 'axios';
import useForm from '@/app/hooks/useForm';

const initialState = {
  modal: false,
  command: '',
}

export type MessageAI = {
  text: string;
  isBot: boolean;
}


const ChatWrapper: React.FC = () => {
  const [modal, setModal] = useState(false);
  const [messages, setMessages] = useState<MessageAI[]>([])

  const {
    form,
    handleInput,
    setForm,
    setLoading,
    loading
  } = useForm(initialState);

  const onSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    const json = {
      command: form.command
    };
    setForm({
      ...form,
      command: ''
    })
    if (form.command) {
      axios.post('/api/openai', json)
        .then(res => {
          console.log(res.data);
          setMessages([
            ...messages,
            { text: form.command, isBot: false },
            res.data
          ])
        })
        .catch(error => {
          console.error('Kesalahan:', error);
        })
        .finally(() =>{ 
        setLoading(false)
        });
    }
  };


  return (
    <>
      <Button onClick={() => setModal(!modal)} className='fixed btn-ghost z-50 bottom-10 end-10'>
        <Image src={chatIcon} width={50} alt='Chat Icon' />
      </Button>
      {modal &&
        <ChatAI
          data={messages}
          loading={loading}
          handleInput={handleInput}
          handleSubmit={onSubmit}
          setModal={setModal}
        />
      }
    </>
  );
};

export default ChatWrapper;