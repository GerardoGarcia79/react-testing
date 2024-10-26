import { Text } from "@radix-ui/themes";
import useLanguage from "../hooks/useLanguage";

const Label = ({ labelId }: { labelId: string }) => {
  const { getLabel } = useLanguage();

  return <Text role="label">{getLabel(labelId)}</Text>;
};

export default Label;
