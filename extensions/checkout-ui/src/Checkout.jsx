import { useEffect, useState } from 'react';
import {
  reactExtension,
  useApi,
  ListItem,
  Text,
  InlineLayout,
  Checkbox,
  Image,
  BlockStack,
  Pressable,
  useCartLines,
  useApplyCartLinesChange,
  Heading,
  BlockSpacer,
  useSettings,
  View,
  InlineSpacer,
} from '@shopify/ui-extensions-react/checkout';

// Set the entry points for the extension
const productBlock = reactExtension("purchase.checkout.cart-line-list.render-after", () => <App />);
export { productBlock };


const variantID = 'gid://shopify/ProductVariant/46156116492562';

function App() {
  const { query } = useApi();
  const [variantData, setVariantData] = useState(null);
  const [isSelected, setIsSelected] = useState(false);

  const cartLines = useCartLines();
  const cartApply = useApplyCartLinesChange();

  const settings = useSettings();

  //const variantID = settings.variant_id_post;

  useEffect(() => {
    let isMounted = true;
  
    async function getVarData() {
      try {
        const queryResult = await query(`{
          node(id: "${variantID}") {
            ... on ProductVariant {
              title
              price {
                amount
                currencyCode
              }
              image {
                url
                altText
              }
              product {
                title
                featuredImage {
                  url
                  altText
                }
              }
            }
          }
        }`);
  
        if (isMounted && queryResult.data) {
          setVariantData(queryResult.data.node);
        }
      } catch (error) {
        console.error('Error fetching variant data:', error);
      }
    }
  
    getVarData();
  
    return () => {
      isMounted = false; // Cleanup to prevent state update on unmounted component
    };
  }, [query, variantID]);
  

  // const handleCheckboxChange = () => {
  //   setIsSelected(!isSelected);
  //   if (!isSelected) {
  //     cartApply({
  //       type: "addCartLine",
  //       quantity: 1,
  //       merchandiseId: variantID
  //     });
  //   } else {
  //     const cartLineId = cartLines.find(cartLine => cartLine.merchandise.id === variantID)?.id;
  //     if (cartLineId) {
  //       cartApply({
  //         type: "removeCartLine",
  //         id: cartLineId,
  //         quantity: 1
  //       });
  //     }
  //   }
  // };
  useEffect(() => {
    if (isSelected) {
      cartApply({
        type: "addCartLine",
        quantity: 1,
        merchandiseId: variantID
      })
    } else {
      const cartLineId = cartLines.find( cartLine => cartLine.merchandise.id === variantID)?.id

      if(cartLineId) {
        cartApply({
          type: "removeCartLine",
          id: cartLineId,
          quantity: 1
        })
      }
    }

  }, [isSelected]);


  return (
    <>
    <Text>miniScript</Text>
    <Heading level={2}>You May Also Like</Heading>
    <BlockSpacer spacing="base"></BlockSpacer>
    <Pressable 
      onPress={() => setIsSelected(!isSelected)}
    >
    <InlineLayout columns={['15%', 'fill']} border="base" padding="base">
      <View  padding="base">
        <Checkbox checked={isSelected}></Checkbox>
      </View>
      <View>
      <InlineLayout columns={['20%', '5%', 'fill']}>
        <View>
        <Image  source={ variantData?.image?.url || variantData?.product?.featuredImage?.url }
        />
        </View>
        <View></View>
        <View>
          <Text>
            {variantData?.product?.title} - {variantData?.title}
          </Text>
          <Text>
            {variantData?.price?.amount} {variantData?.price?.currencyCode}
          </Text>
          </View>
        </InlineLayout>
      </View>
    </InlineLayout>
    </Pressable>
    </>
  );
}
