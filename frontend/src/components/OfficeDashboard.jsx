import React, { useEffect, useState } from 'react';
import { auth, db } from '../App';
import { signOut } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';

export default function OfficeDashboard() {
  const officeId = auth.currentUser.uid;
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [officeInfo, setOfficeInfo] = useState({
    name: '',
    address: '',
    phone: '',
    lat: '',
    lng: '',
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('availability');

  useEffect(() => {
    const loa
