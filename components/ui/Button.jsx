"use client";

const VARIANT_CLASS = {
  default: "",
  primary: "btn-primary",
  danger: "btn-danger",
};

export default function Button({ variant = "default", style, children, ...rest }) {
  return (
    <button className={VARIANT_CLASS[variant]} style={{ fontSize: 12.5, ...style }} {...rest}>
      {children}
    </button>
  );
}
