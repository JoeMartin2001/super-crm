import { useEffect, useState } from "react";

import AppLayout from "src/components/shared/layout";
import { FormatPhoneNumber } from "src/components/shared/formatPhoneNumber";

import { useAppDispatch, useAppSelector } from "src/store/hooks";
import { UserSliceActions } from "src/store/features/users";
import { GroupsSliceActions } from "src/store/features/groups";

import { Group, ROLE, User } from "src/models";
import moment from "moment";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

import { BsPencilSquare } from "react-icons/bs";
import { MdDelete } from "react-icons/md";

import { deleteUser } from "src/lib/firebase/services/user";
import { deleteGroup } from "src/lib/firebase/services/group";
import ChangeTeacher from "src/components/shared/change/teacher";
import { AllMonthlyBill } from "src/components/shared/monthlyBill";

const TeachersPage = () => {
  const dispatch = useAppDispatch();

  const groupsSlice = useAppSelector((g) => g.groupsSlice);

  const schoolSlice = useAppSelector((s) => s.schoolSlice);

  const usersSlices = useAppSelector((u) => u.usersSlice);

  let t = Object.values(usersSlices)?.filter((t) => t.role === ROLE.TEACHER);

  let s = Object.values(usersSlices)?.filter((s) => s.role === ROLE.STUDENT);

  let groups = Object.values(groupsSlice)?.filter(
    (g) => g.school === schoolSlice.id
  );

  const [teachers, setTeachers] = useState(t);
  const [changedStudent, setChangetStudent] = useState<User | []>();
  const [openChangeModal, setOpenChangeModal] = useState<boolean>(false);
  const [msgOpenDelete, setMsgOpenDelete] = useState(false);
  const [msg, setMsg] = useState("");
  const [item, setItem] = useState<User | "">("");

  const openModal = (s: any) => {
    setChangetStudent(s);
    setOpenChangeModal(true);
  };

  useEffect(() => {
    setIsOpen(openChangeModal);
    console.log(openChangeModal);
  }, []);

  const setIsOpen = (i: any) => {
    setOpenChangeModal(i);
  };

  const onDelete = (t: any) => {
    try {
      const deletedStudents = Object.values(usersSlices)?.filter(
        (s) => s.teacher === t.id
      );

      const deletedGroup = Object.values(groupsSlice)?.filter(
        (d) => d.teacher.user === t.id
      );

      setMsgOpenDelete(true);
      setMsg(`Do you realy want to delete ${t?.firstName}`);
      setItem(t);
      if (item !== "") {
        deleteUser(t.id);
        if (deletedGroup !== []) {
          for (let i = 0; i < deletedGroup.length; i++) {
            deleteGroup(deletedGroup[i].id);
            dispatch(GroupsSliceActions.deleteGroup(deletedGroup[i]));
          }
        }
        if (deletedStudents) {
          for (let i = 0; i < deletedStudents.length; i++) {
            deleteUser(deletedStudents[i].id);
          }
        }
        dispatch(UserSliceActions.removeUser(t));
        setMsgOpenDelete(false);
        setMsg("");
        setItem("");
        toast.success("Deleting has been successfully");
      }
    } catch (error) {
      toast.error("Error, while deleting");
    }
  };

  const onFilterTeachers = (e: any) => {
    setTeachers(
      t.filter((t) =>
        t.firstName
          .toLocaleLowerCase()
          .includes(e.target.value?.toLocaleLowerCase())
      )
    );
  };

  return (
    <AppLayout>
      <div className="p-5 w-full flex flex-col gap-2">
        <ChangeTeacher
          isOpen={openChangeModal}
          setIsOpen={(i: any) => setIsOpen(i)}
          item={changedStudent}
        />
        <div className=" w-full h-auto flex justify-between items-center mb-3">
          <input
            onChange={(e) => onFilterTeachers(e)}
            className="w-[200px] h-[40px] rounded-[5px] pl-2 outline-none ring-[1px] focus:ring-app-primary focus:ring-offset-2 hover:ring-blue-400"
            type="text"
            placeholder="Search"
          />
          <Link to={"/create/teacher"}>
            <button className="w-[200px] h-[40px] rounded-md bg-app-secondary hover:bg-app-secondary-lighter text-white font-bold">
              Add new teacher
            </button>
          </Link>
        </div>
        <div className="p-1 w-full min-h-[600px] bg-white shadow-md rounded-[5px]">
          <div className="w-full flex items-center border-b py-3">
            <div className=" mx-1 text-base flex items-center justify-start pl-2 font-bold flex-[2] h-full">
              First Name
            </div>
            <div className="mx-1 text-base flex items-center justify-start pl-2 font-bold flex-[2] h-full">
              Last Name
            </div>
            <div className="mx-1 text-base flex items-center justify-start pl-2 font-bold flex-[2] h-full">
              Languages
            </div>
            <div className="mx-1 text-base flex items-center justify-start pl-2 font-bold flex-[2] h-full">
              Number
            </div>
            <div className="mx-1 text-base flex items-center justify-start pl-2 font-bold flex-[2] h-full">
              Num. of groups
            </div>
            <div className="mx-1 text-base flex items-center justify-start pl-2 font-bold flex-[3] h-full">
              Email
            </div>
            <div className="mx-1 text-base flex items-center justify-start pl-2 font-bold flex-[2] h-full">
              Started date
            </div>
            <div className="mx-1 text-base flex items-center justify-start pl-2 font-bold flex-[1] h-full">
              Change
            </div>
          </div>

          {msgOpenDelete && (
            <div className="absolute w-[400px] h-[70px] rounded-lg z-[2] top-[35%] left-[40%] bg-app-primary shadow-md flex p-2 flex-col gap-2">
              <div className="flex-[2] flex justify-center items-center">
                {msg}
              </div>
              <div className="flex-[1] flex justify-around items-center">
                <div
                  className=" font-semibold font-mono text-white h-full w-[90px] rounded-sm bg-app-secondary
                 flex items-center justify-around"
                  onClick={() => {
                    onDelete(item);
                  }}
                >
                  YES
                </div>
                <div
                  className=" font-semibold font-mono text-white h-full w-[90px] rounded-sm bg-app-secondary
                 flex items-center justify-around"
                  onClick={() => {
                    setMsgOpenDelete(false);
                    setItem("");
                  }}
                >
                  NO
                </div>
              </div>
            </div>
          )}
          {teachers.map((t, i) => (
            <div
              key={i}
              className="p-1 w-full h-auto bg-white  rounded-[5px] flex items-center  py-3"
            >
              <div className=" mx-1 capitalize text-base font-semibold  flex items-center justify-start pl-2 font-mono flex-[2] h-full">
                <div className=" w-[30px] h-[30px] mr-1">
                  <img
                    src={t.img}
                    className=" h-full w-full rounded-full hover:h-[200px] hover:w-[200px] hover:absolute hover:shadow-md"
                  />
                </div>
                {t.firstName}
              </div>
              <div className=" mx-1 capitalize text-base font-semibold  flex items-center justify-start pl-2 font-mono flex-[2] h-full">
                {t.lastName}
              </div>
              <div className=" mx-1 capitalize text-base font-semibold  flex items-center justify-start pl-2 font-mono flex-[2] h-full">
                {t.languages?.map((p) => (
                  <p className="mx-2">{p}</p>
                ))}
              </div>
              <div className="mx-1 text-base font-semibold  flex items-center justify-start pl-0 font-mono flex-[2] h-full">
                {`(${FormatPhoneNumber(Number(t.phone)).code}) ${
                  FormatPhoneNumber(Number(t.phone)).oneThree
                } ${FormatPhoneNumber(Number(t.phone)).fourFive} ${
                  FormatPhoneNumber(Number(t.phone)).sixSeven
                }`}
              </div>
              <div
                title={String(
                  groups
                    ?.filter((l) => l.teacher.user === t.id)
                    ?.map((n) => {
                      return n.name;
                    })
                )}
                className="mx-1 text-base  font-semibold  flex items-center justify-start pl-2 font-mono flex-[2] h-full"
              >
                {groups?.filter((l) => l.teacher.user === t.id)?.length}
              </div>
              <div className="mx-1 text-base font-semibold  flex items-center justify-start pl-2 font-mono flex-[3] h-full">
                {t.email}
              </div>
              <div className="mx-1 text-base font-semibold  flex items-center justify-start pl-2 font-mono flex-[2] h-full">
                {moment(Number(t.startedTime)).format("MMMM Do YYYY")}
              </div>
              <div className="mx-1 text-base font-semibold  flex items-center gap-4 justify-around pl- font-monod flex-[1] h-full">
                <BsPencilSquare
                  onClick={() => openModal(t)}
                  className=" h-[20px] w-[20px] hover:text-app-secondary hover:w-[30px] hover:h-[30px]"
                />
                <MdDelete
                  onClick={() => onDelete(t)}
                  className=" h-[20px] w-[20px] hover:text-red-500 hover:w-[30px] hover:h-[30px]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default TeachersPage;
