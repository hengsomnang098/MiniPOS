"use client";
import { useEffect, useState } from "react";

export default function PreloadCSS() {
    const [cssFiles, setCssFiles] = useState<any[]>([]);

    useEffect(() => {
        fetch("/_next/static/ssr-manifest.json")
            .then((res) => res.json())
            .then((manifest) => {
                const cssPaths = Object.values(manifest)
                    .flat()
                    .filter((f: any) => f.endsWith(".css"));
                setCssFiles(cssPaths);
            })
            .catch(() => { });
    }, []);

    return (
        <>
            {cssFiles.map((href) => (
                <link
                    key={href}
                    rel="preload"
                    href={href}
                    as="style"
                    onLoad={(e) => { (e.target as HTMLLinkElement).rel = 'stylesheet'; }}
                />
            ))}
        </>
    );
}
