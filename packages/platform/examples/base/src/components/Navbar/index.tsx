import { Link } from '@tanstack/react-router';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Navbar({ username }: { username?: string }) {
  return (
    <nav className="flex h-[75px] w-full items-center justify-between bg-black px-14 py-3 text-white">
      <div className={"flex h-full items-center text-lg"}>
        <Link to="/">
          <h1 className="bg-linear-to-r from-[#8A2387] via-[#E94057] to-[#F27121] bg-clip-text text-2xl font-bold text-transparent">
            CalSync
          </h1>
        </Link>
      </div>
      <div className={"font-sans antialiased"}>
        <ul className="flex gap-x-7">
          <li>
            <Link to="/calendar-view">Week View</Link>
          </li>
          <li>
            <Link to="/calendars">Calendar</Link>
          </li>
          <li>
            <Link to="/availability">Availability</Link>
          </li>
          <li>
            <Link to="/troubleshooter">Troubleshooter</Link>
          </li>
          <li>
            <Link to="/event-types">EventTypes</Link>
          </li>
          <li>
            <Link to="/booking">Book Me</Link>
          </li>
          <li>
            <Link to="/bookings">My Bookings</Link>
          </li>
          <li>
            <Link to="/embed">Embed</Link>
          </li>

          <li>
            <Link to="/conferencing-apps">Conferencing Apps</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
