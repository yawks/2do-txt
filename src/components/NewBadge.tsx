import { Badge, styled } from "@mui/material";
import { isAfter } from "date-fns";
import { useTranslation } from "react-i18next";
import { WithChildren } from "../types/common";
import { todayDate } from "../utils/date";

interface NewBadgeProps extends WithChildren {
  till: Date;
}

const StyledBadge = styled(Badge)({
  ".MuiBadge-badge": {
    transform: "scale(.9) translate(108%, -20%)",
  },
});

const NewBadge = ({ till, children }: NewBadgeProps) => {
  const today = todayDate();
  const { t } = useTranslation();

  if (isAfter(today, till)) {
    return <>{children}</>;
  }

  return (
    <StyledBadge color="primary" badgeContent={t("New")}>
      {children}
    </StyledBadge>
  );
};

export default NewBadge;