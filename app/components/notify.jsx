export function Notify({ response, transition }) {
  const classes = transition.state === "submitting" ? "" : " text-center animate-fadeout opacity-0 bg-cyan-600 text-white  p-5 font-bold";
  return <div className="fixed bottom-0 right-0 left-0 z-10">{response && <div className={classes}>{response.status}</div>}</div>;
}
