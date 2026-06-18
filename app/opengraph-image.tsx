import { ImageResponse } from "next/og";

export const alt = "Design Atlas — Ressources utiles pour les créateurs du web";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#E8E8E3",
                    color: "#080807",
                    padding: "80px",
                }}
            >
                <div
                    style={{
                        fontSize: 30,
                        letterSpacing: 4,
                        textTransform: "uppercase",
                        color: "#938F8A",
                    }}
                >
                    Design Atlas
                </div>
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 24,
                    }}
                >
                    <div
                        style={{
                            fontSize: 76,
                            lineHeight: 1.1,
                            maxWidth: 900,
                            fontWeight: 500,
                        }}
                    >
                        Ressources utiles pour les créateurs du web
                    </div>
                    <div style={{ fontSize: 32, color: "#080807" }}>
                        Sélectionnées et partagées par des designers, pour des
                        designers.
                    </div>
                </div>
            </div>
        ),
        { ...size },
    );
}
