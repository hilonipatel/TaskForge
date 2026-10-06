type PageLayoutProps = {
    title: string;
    children: React.ReactNode;
};

function PageLayout({ title, children }: PageLayoutProps) {
    return (
        <div className="container">
            <header
                style={{
                    padding: "1.5rem 0",
                    marginBottom: "1.5rem",
                    borderBottom: "1px solid #e2e8f0",
                }}
            >
                <h1
                    style={{
                        marginBottom: "0.25rem",
                        color: "#2563eb",
                    }}
                >
                    TaskForge
                </h1>

                <p
                    style={{
                        margin: 0,
                        color: "#64748b",
                    }}
                >
                    {title}
                </p>
            </header>

            <main>{children}</main>
        </div>
    );
}

export default PageLayout;
