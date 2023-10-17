import CardContainer from "@/app/components/Card/CardContainer";
import { Flex } from "@/app/components/Container/Flex";
import MenuFilter from "@/app/components/Menu/MenuFillter";
import ScrollMenuContainer from "@/app/components/Menu/ScrollMenuContainer";
import { getItem } from "@/app/utils/queryDb";

const page = async ({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) => {
  const products = await getItem(searchParams);

  return (
    <>
      <Flex variant={'row'} className="md:px-4 gap-5">
        <div className="w-[27.6%] mt-5 hidden md:block overflow-hidden">
          <MenuFilter />
        </div>
        <div className="w-full relative px-3 md:px-0 mt-3 md:mt-0 md:w-[73.4%]">
          <div className="sticky top-12 md:top-16 py-2 md:py-4 z-30 bg-white">
            <ScrollMenuContainer />
          </div>
          <CardContainer
            data={products}
          />
        </div>
      </Flex>
    </>
  );
};

export default page;