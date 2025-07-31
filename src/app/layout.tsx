 
export default function Layout({ children }: { children: React.ReactNode }) {

return (
   <html>
     <title>Chatbot</title>
      <body>
        {children}
      </body>
    </html>
  )
}