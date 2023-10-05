import { faq,  FaqItem } from '../helpers/dataObject'
import Accordion from "../components/Accordion/Accordion";
import { Heading } from "../components/Container/Heading";

const page: React.FC = () => {
  return (
    <>
        <section className="flex flex-col gap-3 mt-5 max-w-2xl m-4 sm:mx-auto">
        <Heading fs={'xl4'} ff={'neue'} className='text-center'>
          FAQ
        </Heading>
          {faq?.map((item: FaqItem) =>
            <Accordion 
              key={item.id}
              label={item.q}
              content={item.a}
            />
          )}
        </section>
      </>
  );
};

export default page;