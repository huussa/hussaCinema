import Image from "next/image";
import Link from "next/link";

export default function Logo({ href = "/", mobile = false }) {
  return (
    <Link href={href} className="block shrink-0">
      <Image
        src="/onCinema-logo.svg"
        alt="onCinema"
        width={270}
        height={90}
        priority
        className={`${mobile ? "w-[155px]" : "w-[185px]"} h-auto`}
      />
    </Link>
  );
}
